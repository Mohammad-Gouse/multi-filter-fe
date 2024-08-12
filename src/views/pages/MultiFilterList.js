import React, { useState, useEffect, useRef, useMemo } from 'react';
import axios from 'axios';
import FilterComponent from '@/components/FilterComponent';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import FilterListIcon from '@mui/icons-material/FilterList';
import PushPinIcon from '@mui/icons-material/PushPin';


import { DataGrid, GridColumnMenu } from '@mui/x-data-grid';
import { Box, ListItemIcon, MenuItem, ListItemText } from '@mui/material';

// const columns = [
//   { field: 'id', headerName: 'ID', width: 300, align: "center", headerAlign: "center" },
//   { field: 'name', headerName: 'Name', width: 300, align: "center", headerAlign: "center" },
//   { field: 'age', headerName: 'Age', width: 300, align: "right", headerAlign: "right" },
//   { field: 'salary', headerName: 'Salary', width: 300, align: "right", headerAlign: "right" },
// ];

const initialColumns = [
  {
    field: 'id',
    headerName: 'ID',
    width: 350,
    headerClassName: 'stickyCells',
    cellClassName: 'stickyCells',
  },
  { 
    field: 'name',
    headerName: 'Name',
    width: 350,
    headerClassName: '',
    cellClassName: '',
  },
  { field: 'age', headerName: 'Age', width: 350 },
  { field: 'salary', headerName: 'Salary', width: 350 },
];

const MultiFilterList = () => {
  const [data, setData] = useState([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [filters, setFilters] = useState([
    { column: 'name', operation: 'contains', value: [], logicalOperator: 'and' }
  ]);
  const [showFilter, setShowFilter] = useState(false);
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 });
  const [loading, setLoading] = useState(false); // Loading state
  const [error, setError] = useState(null); // Error state

  const [columns, setColumns] = useState(initialColumns);


  const reorderColumn = (field) => {
    setColumns(prevColumns => {
      const columnToMove = prevColumns.find(col => col.field === field);
      const otherColumns = prevColumns.filter(col => col.field !== field);

      const updatedColumns = [
        { 
          ...columnToMove,
          headerClassName: 'stickyCells',
          cellClassName: 'stickyCells',
        },
        ...otherColumns.map(col => ({
          ...col,
          headerClassName: '',
          cellClassName: '',
        }))
      ];

      return updatedColumns;
    });
  };

  // Fetch data based on pagination model and filters
  const fetchData = async () => {
    setLoading(true); // Set loading to true
    setError(null); // Clear previous error
    try {
      const response = await axios.post('http://localhost:3000/api/employees', {
        page: paginationModel.page + 1, // API is 1-indexed
        limit: paginationModel.pageSize,
        filters: filters.reduce((acc, filter) => {
          if (filter.value.length > 0) {
            acc[filter.column] = filter.value;
          }
          return acc;
        }, {}),
        operator: filters.length > 1 ? filters[1].logicalOperator : 'and',
      });
      setData(response.data.rows);
      setTotalRecords(response.data.totalFilteredCount);
    } catch (error) {
      setError('Error fetching data. Please try again later.'); // Set error message
    } finally {
      setLoading(false); // Set loading to false
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

  function CustomUserItem(props) {
    const { myCustomHandler, myCustomValue } = props;
    return (
      <MenuItem onClick={myCustomHandler}>
        <ListItemIcon>
          <PushPinIcon fontSize="small" />
        </ListItemIcon>
        <ListItemText>{myCustomValue}</ListItemText>
      </MenuItem>
    );
  }

  function CustomColumnMenu(props) {
    return (
      <GridColumnMenu
        {...props}
        slots={{
          // Add new item
          columnMenuUserItem: CustomUserItem,
        }}
        slotProps={{
          columnMenuUserItem: {
            // set `displayOrder` for new item
            displayOrder: 15,
            // pass additional props
            myCustomValue: 'Pin Column',
            myCustomHandler: () => {
              reorderColumn(props.colDef.field)
            } 
          },
        }}
      />
    );
  }


  return (
    <div style={{ height: 600, width: '100%', margin:'20px 0px' }}>
      <Button
        variant="contained"
        color="primary"
        onClick={() => setShowFilter(!showFilter)}
        style={{ marginBottom: 16 }}
      >
        {/* {showFilter ? 'Hide Filter' : 'Show Filter'} */}
       <FilterListIcon></FilterListIcon>
      </Button>
      {showFilter && (
        <FilterComponent
          filters={filters}
          setFilters={setFilters}
          onApplyFilters={handleApplyFilters}
          onClearFilters={handleClearFilters}
        />
      )}
      {/* {loading && (
        <div style={{ textAlign: 'center', padding: 20 }}>
          <CircularProgress />
        </div>
      )} */}
      {error && (
        <Typography color="error" style={{ textAlign: 'center', padding: 20 }}>
          {error}
        </Typography>
      )}
      <DataGrid
        rows={data}
        columns={columns}
        rowCount={rowCount}
        slots={{ columnMenu: CustomColumnMenu }}
        pagination
        paginationMode="server"
        pageSize={paginationModel.pageSize}
        paginationModel={paginationModel}
        onPaginationModelChange={(newPaginationModel) => setPaginationModel(newPaginationModel)}
        pageSizeOptions={[5, 10, 20]} // Page size options
        loading={loading} // Show loading state
        disableSelectionOnClick
        style={{ height: '450px' }}
        sx={{
          '& .stickyCells': {
            backgroundColor: 'white',
            position: 'sticky',
            left: 0,
            zIndex: 1,
            boxShadow: '4px 0px 6px rgba(0, 0, 0, 0.1)',
          }
        }}
      />
    </div>
  );
};

export default MultiFilterList;

