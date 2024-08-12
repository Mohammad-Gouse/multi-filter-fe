import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { DataGrid, GridColumnMenu } from '@mui/x-data-grid';
import { Box, ListItemIcon, MenuItem, ListItemText } from '@mui/material';
// import SettingsApplicationsIcon from '@mui/icons-material/SettingsApplications';
import PushPinIcon from '@mui/icons-material/PushPin';

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
    // headerClassName: 'stickyCells2',
    // cellClassName: 'stickyCells2',
  },
  { field: 'age', headerName: 'Age', width: 350 },
  { field: 'salary', headerName: 'Salary', width: 350 },
];

// const columns = [
//   { field: 'id', headerName: 'ID', width: 200 },
//   { field: 'name', headerName: 'Name', width: 200 },
//   { field: 'age', headerName: 'Age', width: 500 },
//   { field: 'salary', headerName: 'Salary', width: 500 },
// ];



  // Function to handle column reordering


const DataGridList = () => {
  const [data, setData] = useState([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);

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


  const fetchData = async () => {
    try {
      const response = await axios.post('http://localhost:3000/api/employees', {
        page: page,
        limit: pageSize,
      });
      setData(response.data.rows);
      setTotalRecords(response.data.totalFilteredCount);
    } catch (error) {
      console.error('Error fetching data', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [page, pageSize]);


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
    <Box style={{ height: 600, width: '100%' }}>
      <DataGrid
        rows={data}
        columns={columns}
        slots={{ columnMenu: CustomColumnMenu }}
        pagination
        pageSize={pageSize}
        rowCount={totalRecords}
        paginationMode="server"
        onPageChange={(newPage) => setPage(newPage + 1)}
        onPageSizeChange={(newPageSize) => setPageSize(newPageSize)}
        loading={!data.length}
        disableSelectionOnClick
        columnBuffer={columns.length}
        getRowClassName={params => 'fix-row'}
        sx={{
          '& .stickyCells': {
            backgroundColor: 'white',
            position: 'sticky',
            left: 0,
            zIndex: 1,
            boxShadow: '4px 0px 6px rgba(0, 0, 0, 0.1)',
          },
          '& .stickyCells2': {
            backgroundColor: 'white',
            position: 'sticky',
            left: 350,
            zIndex: 1,
            boxShadow: '4px 0px 6px rgba(0, 0, 0, 0.1)',
          }
        }}

      />
    </Box>
  );
};

export default DataGridList;
