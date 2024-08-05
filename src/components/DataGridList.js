import React, { useState, useEffect, useRef, useMemo } from 'react';
import axios from 'axios';
import { DataGrid } from '@mui/x-data-grid';
import FilterComponent from './FilterComponent';
import Button from '@mui/material/Button';

const columns = [
  { field: 'id', headerName: 'ID', width: 100 },
  { field: 'name', headerName: 'Name', width: 200 },
  { field: 'age', headerName: 'Age', width: 150 },
  { field: 'salary', headerName: 'Salary', width: 200 },
];

const DataGridList = () => {
  const [data, setData] = useState([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [filters, setFilters] = useState([
    { column: 'name', operation: 'contains', value: [], logicalOperator: 'and' }
  ]);
  const [showFilter, setShowFilter] = useState(false);
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 });

  // Fetch data based on pagination model and filters
  const fetchData = async () => {
    try {
      const response = await axios.post('http://localhost:3000/api/employees', {
        page: paginationModel.page + 1, // API is 1-indexed
        limit: paginationModel.pageSize,
        filters: filters.reduce((acc, filter) => {
          if (filter.value.length > 0) {
            acc[filter.column] = filter.value.map(v => v.id);
          }
          return acc;
        }, {}),
        operator: filters.length > 1 ? filters[0].logicalOperator : 'and',
      });
      setData(response.data.rows);
      setTotalRecords(response.data.total);
    } catch (error) {
      console.error('Error fetching data', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [paginationModel, filters]);

  const handleApplyFilters = () => {
    fetchData();
  };

  const handleClearFilters = () => {
    setFilters([{ column: 'name', operation: 'contains', value: [], logicalOperator: 'and' }]);
    fetchData(); // Fetch data again after clearing filters
  };

  const rowCountRef = useRef(totalRecords || 1);

  const rowCount = useMemo(() => {
    if (totalRecords !== undefined) {
      rowCountRef.current = totalRecords;
    }
    return rowCountRef.current;
  }, [totalRecords]);

  return (
    <div style={{ height: 600, width: '100%' }}>
      <Button
        variant="contained"
        color="primary"
        onClick={() => setShowFilter(!showFilter)}
        style={{ marginBottom: 16 }}
      >
        {showFilter ? 'Hide Filter' : 'Show Filter'}
      </Button>
      {showFilter && (
        <FilterComponent
          filters={filters}
          setFilters={setFilters}
          onApplyFilters={handleApplyFilters}
          onClearFilters={handleClearFilters}
        />
      )}
      <DataGrid
        rows={data}
        columns={columns}
        rowCount={rowCount}
        pagination
        paginationMode="server"
        pageSize={paginationModel.pageSize}
        paginationModel={paginationModel}
        onPaginationModelChange={(newPaginationModel) => setPaginationModel(newPaginationModel)}
        pageSizeOptions={[5, 10, 20]} // Page size options
        loading={!data.length && paginationModel.page === 0} // Show loading state if data is being fetched
        components={{
          NoRowsOverlay: () => (
            <div style={{ padding: 16, textAlign: 'center' }}>
              No rows
            </div>
          ),
        }}
        style={{ height: '450px' }}
      />
    </div>
  );
};

export default DataGridList;
