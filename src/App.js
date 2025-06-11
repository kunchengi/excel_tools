import { Upload, Button, Select, Table, message } from 'antd';
import './App.scss';
import { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';

export default function App() {
  // 第一个Excel文件相关数据
  const [excelData1, setExcelData1] = useState([]);
  const [headers1, setHeaders1] = useState([]);
  const [isLoading1, setIsLoading1] = useState(false);
  const [fileList1, setFileList1] = useState([]);

  const handleFirstExcel = (file) => {
    setFileList1([file]);
    setIsLoading1(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);
      
      // 提取表头
      const headerRow = XLSX.utils.sheet_to_json(worksheet, { header: 1 })[0];
      console.log(headerRow);
      console.log(jsonData);
      setHeaders1(headerRow);
      setExcelData1(jsonData);
      setIsLoading1(false);
    };
    reader.readAsArrayBuffer(file);
    return false; // 阻止默认上传
  };

  // 第二个Excel文件相关数据
  const [excelData2, setExcelData2] = useState([]);
  const [headers2, setHeaders2] = useState([]);
  const [isLoading2, setIsLoading2] = useState(false);
  const [fileList2, setFileList2] = useState([]);

  const handleSecondExcel = (file) => {
    setFileList2([file]);
    setIsLoading2(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);
      
      const headerRow = XLSX.utils.sheet_to_json(worksheet, { header: 1 })[0];
      console.log(headerRow);
      console.log(jsonData);
      setHeaders2(headerRow);
      setExcelData2(jsonData);
      setIsLoading2(false);
    };
    reader.readAsArrayBuffer(file);
    return false;
  };

  // headers1和headers2的交集
  const [commonHeaders, setCommonHeaders] = useState([]);
  // 关联表头选择（多选）
  const [selectedKeys, setSelectedKeys] = useState([]);
  // 对比字段选择
  const [selectedHeaders, setSelectedHeaders] = useState([]);

  useEffect(() => {
    // 交集
    const newCommonHeaders = headers1.filter(h => headers2.includes(h));
    setCommonHeaders(newCommonHeaders);
    setSelectedKeys(newCommonHeaders.length > 0 ? [newCommonHeaders[0]] : []);
    setSelectedHeaders([]);
  }, [headers1, headers2]);

  // 检查key是否唯一（多字段组合）
  const checkKey = (excelData) => {
    const keySet = new Set();
    for(let row of excelData){
      const key = selectedKeys.map(k => row[k]).join('__');
      if (keySet.has(key)) {
        return false;
      }
      keySet.add(key);
    };
    return true;
  }

  useEffect(() => {
    setSelectedHeaders([]);
  }, [selectedKeys]);

  // 获取对比字段选项
  const getComparisonOptions = () => {
    // 过滤掉关联表头
    const options = commonHeaders.filter(h => !selectedKeys.includes(h));
    return options.map(h => ({ value: h, label: h }))
  }

  // 差异数据和表头
  const [diffData1, setDiffData1] = useState([]);
  const [diffData2, setDiffData2] = useState([]);
  const [diffColumns, setDiffColumns] = useState([]);

  // 对比逻辑
  const handleCompare = () => {
    if (!selectedKeys.length || !selectedHeaders.length) return;
    // 检查关联表头是否唯一
    if(!checkKey(excelData1) || !checkKey(excelData2)){
      setSelectedKeys([]);
      message.error('关联表头组合重复，请选择唯一的表头组合作为关联表头');
      return;
    }
    // 用key做map
    const getKey = (row) => selectedKeys.map(k => row[k]).join('__');
    const map2 = new Map();
    excelData2.forEach((row, index) => {
      map2.set(getKey(row), { ...row, rowIndex: index + 1 });
    });
    const diffRows1 = [];
    const diffRows2 = [];
    excelData1.forEach((row1, index) => {
      const key = getKey(row1);
      const row2 = map2.get(key);
      if (!row2) return; // 只对比两表都有的key
      let hasDiff = false;
      const diffRow1 = { key, rowIndex: index + 1 };
      const diffRow2 = { key, rowIndex: row2.rowIndex };
      selectedHeaders.forEach(h => {
        const isDiff = row1[h] !== row2[h];
        if (isDiff) hasDiff = true;
        diffRow1[h] = { value: row1[h], diff: isDiff };
        diffRow2[h] = { value: row2[h], diff: isDiff };
      });
      // 多字段key展示
      selectedKeys.forEach(k => {
        diffRow1[k] = { value: row1[k], diff: false };
        diffRow2[k] = { value: row2[k], diff: false };
      });
      if (hasDiff) {
        diffRows1.push(diffRow1);
        diffRows2.push(diffRow2);
      }
    });
    // 生成columns
    const columns = [
      {
        title: '序号',
        dataIndex: 'rowIndex',
        key: 'rowIndex',
        width: 70,
        render: (cell) => (cell !== undefined ? cell + 1 : ''),
      },
      ...selectedKeys.map(k => ({
        title: k,
        dataIndex: k,
        key: k,
        render: (cell) => cell?.value ?? '',
        width: 100,
      })),
      ...selectedHeaders.map(h => ({
        title: h,
        dataIndex: h,
        key: h,
        render: (cell) => cell?.diff ? (
          <span style={{ background: '#ffe58f' }}>{cell?.value ?? ''}</span>
        ) : (cell?.value ?? ''),
        width: 100,
      }))
    ];
    setDiffData1(diffRows1);
    setDiffData2(diffRows2);
    setDiffColumns(columns);
  };

  // 删除文件
  const onRemoveFile = (type='first') => {
    if(type === 'first'){
      setFileList1([]);
      setExcelData1([]);
      setHeaders1([]);
    }else{
      setFileList2([]);
      setExcelData2([]);
      setHeaders2([]);
    }
    setCommonHeaders([]);
    setSelectedKeys([]);
    setSelectedHeaders([]);
    setDiffData1([]);
    setDiffData2([]);
    setDiffColumns([]);
  }

  return (
    <div className="excel-compare-container">
      {/* 文件上传区域 */}
      <div className="upload-section">
        <Upload.Dragger 
          className="upload-box"
          accept=".xlsx,.xls"
          beforeUpload={handleFirstExcel}
          fileList={fileList1}
          onRemove={() => onRemoveFile('first')}
        >
          {isLoading1 ? 
            <p>解析中...</p> : 
            (fileList1.length > 0 ? 
              fileList1[0].name : 
              <p>点击或拖拽上传第一个Excel文件</p>)
          }
        </Upload.Dragger>
        
        <Upload.Dragger 
          className="upload-box"
          accept=".xlsx,.xls"
          beforeUpload={handleSecondExcel}
          fileList={fileList2}
          onRemove={() => onRemoveFile('second')}
        >
          {isLoading2 ? 
            <p>解析中...</p> : 
            (fileList2.length > 0 ? 
              fileList2[0].name : 
              <p>点击或拖拽上传第二个Excel文件</p>)
          }
        </Upload.Dragger>
      </div>

      {/* 表头选择区域 */}
      <div className="config-section">
        <Select
          mode="multiple"
          placeholder="选择关联表头KEY"
          style={{ width: 300 }}
          value={selectedKeys}
          options={commonHeaders.map(h => ({ value: h, label: h }))}
          onChange={value => setSelectedKeys(value)}
        />
        
        <Select
          mode="multiple"
          placeholder="选择对比字段"
          style={{ width: 400 }}
          options={getComparisonOptions()}
          value={selectedHeaders}
          onChange={values => setSelectedHeaders(values)}
        />
        
        <Button type="primary" onClick={handleCompare}>开始对比</Button>
      </div>

      {/* 差异展示表格 */}
      <div className="result-section">
        <div className="compare-table">
          <Table
            columns={diffColumns}
            dataSource={diffData1}
            scroll={{ x: true }}
            pagination={false}
          />
        </div>
        
        <div className="compare-table">
          <Table
            columns={diffColumns}
            dataSource={diffData2}
            scroll={{ x: true }}
            pagination={false}
          />
        </div>
      </div>
    </div>
  );
}
