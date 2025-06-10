import { Upload, Button, Select, Table } from 'antd';
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

  const [selectedKey, setSelectedKey] = useState('');
  const [selectedFields, setSelectedFields] = useState([]);

  useEffect(() => {
    // setSelectedFields(headers1);
  }, [headers1]);

  return (
    <div className="excel-compare-container">
      {/* 文件上传区域 */}
      <div className="upload-section">
        <Upload.Dragger 
          className="upload-box"
          accept=".xlsx,.xls"
          beforeUpload={handleFirstExcel}
          fileList={fileList1}
          onRemove={() => setFileList1([])}
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
          onRemove={() => setFileList2([])}
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
          placeholder="选择关联表头KEY"
          style={{ width: 300 }}
          options={headers1.map(h => ({ value: h, label: h }))}
          onChange={value => setSelectedKey(value)}
        />
        
        <Select
          mode="multiple"
          placeholder="选择对比字段"
          style={{ width: 400 }}
          options={headers1.map(h => ({ value: h, label: h }))}
          value={selectedFields}
          onChange={values => setSelectedFields(values)}
        />
        
        <Button type="primary">开始对比</Button>
      </div>

      {/* 差异展示表格 */}
      <div className="result-section">
        <div className="compare-table">
          <Table
            columns={[]}
            dataSource={[]}
            scroll={{ x: true }}
            pagination={false}
          />
        </div>
        
        <div className="compare-table">
          <Table
            columns={[]}
            dataSource={[]}
            scroll={{ x: true }}
            pagination={false}
          />
        </div>
      </div>
    </div>
  );
}
