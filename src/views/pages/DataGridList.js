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
    headerClassName: `idClass`,
    cellClassName: 'idClass',
  },
  {
    field: 'name',
    headerName: 'Name',
    width: 350,
    headerClassName: 'nameClass',
    cellClassName: 'nameClass',
  },
  {
    field: 'age',
    headerName: 'Age',
    width: 350,
    headerClassName: 'ageClass',
    cellClassName: 'ageClass'
  },
  {
    field: 'salary',
    headerName: 'Salary',
    width: 350,
    headerClassName: 'salaryClass',
    cellClassName: 'salaryClass'
  },
];




// Function to handle column reordering


const DataGridList = () => {
  const [data, setData] = useState([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);

  const [columns, setColumns] = useState(initialColumns);

  const [isPin, setIsPin] = useState(false)
  const [pinText, setPinText] = useState('Pin Column')

  const [currentLeft, setCurrentLeft] = useState(0)
  const [countPin, setCountPin] = useState(0)
  const [countUnPin, setCountUnPin] = useState(0)
 
  const [allColumnState, setAllColumnState] = useState([
    {
      field: 'id',
      style: {},
      isPin: false,
      width: 350
    },
    {
      field: 'name',
      style: {},
      isPin: false,
      width: 350
    },
    {
      field: 'age',
      style: {},
      isPin: false,
      width: 350
    },
    {
      field: 'salary',
      style: {},
      isPin: false,
      width: 350
    }
  ])


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
    const { pinHandler, pinText } = props;
    return (
      <MenuItem onClick={pinHandler}>
        <ListItemIcon>
          <PushPinIcon fontSize="small" />
        </ListItemIcon>
        <ListItemText>{pinText}</ListItemText>
      </MenuItem>
    );
  }

  function getCurrentLeft() {
    return currentLeft
  }




  function pinColumn(field) {
    allColumnState.forEach((column, index) => {
      if (column.field == field) {
        column.isPin = !column.isPin
        setPinText(column.isPin ? 'Un pin' : 'Pin')
        setCurrentLeft(column.isPin ? currentLeft + 350 : currentLeft - 350)
        column.style = column.isPin ?
        {
          backgroundColor: 'white',
          position: 'sticky',
          left: getCurrentLeft(),
          zIndex: 1,
          boxShadow: '4px 0px 6px rgba(0, 0, 0, 0.1)',
        } : {}
        
      }
    })
    reorderColumnSticky(field)
    reorderIfExistOne()
    // reorderIfExistMore()
  }

  function reorderIfExistOne(){
    let countAllPin = 0
    let field
    allColumnState.forEach((col)=>{
      if(col.isPin == true){
        countAllPin += 1
        field = col.field
      }
    })

    if(countAllPin == 1){
      allColumnState.forEach((col)=>{
        if(col.field == field){
          col.style.left = 0;
        }
      })
    }
  }

  function reorderIfExistMore(){
    allColumnState.forEach((col, index)=>{

      console.log(col.isPin)
      // if(col.isPin){
      //   setCountPin(p => p+1)
      // } else {
      //   setCountUnPin(p => p+1)
      // }
    })

    console.log(countPin, countUnPin)
  }

  const reorderColumnSticky = (field) => {
    setColumns(prevColumns => {
      // const selectedColumn = prevColumns.filter(col => col.field == field);
      const unPinColumns = columns.filter(col => {
        const correspondingState = allColumnState.find(state => state.field === col.field);
        return correspondingState && !correspondingState.isPin;
      });

      const pinColumns = columns.filter((col, index) => {
        const correspondingState = allColumnState.find(state => state.field === col.field);
        return correspondingState && correspondingState.isPin;
      });
      const reorderedColumns = [...pinColumns, ...unPinColumns];
      return reorderedColumns;
    });
  };


  function CustomColumnMenu(props) {

    allColumnState.forEach((column) => {
      if (column.field == props.colDef.field) {
        setPinText(column.isPin ? 'Un pin' : 'Pin')
      }
    })
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
            pinText: pinText,
            pinHandler: () => {
              pinColumn(props.colDef.field)
            }
          },
        }}
      />
    );
  }

  const fieldClasses =
  {
    idClass: {
      // backgroundColor: 'white',
      // position: 'sticky',
      // left: 0,
      // zIndex: 1,
      // boxShadow: '4px 0px 6px rgba(0, 0, 0, 0.1)',
    },
    nameClass: {
    },
    ageClass: {
    },
    salaryClass: {

    },
  }

  const columnStickyAcitive = {
    isFirstActive: true,
    isSecondActive: false,
    isThirdActive: false,
    isFourthActive: false
  }

  const stickyState = {
    '& .idClass': allColumnState.find(column => column.field === 'id')?.style,
    '& .nameClass': allColumnState.find(column => column.field === 'name')?.style,
    '& .ageClass': allColumnState.find(column => column.field === 'age')?.style,
    '& .salaryClass': allColumnState.find(column => column.field === 'salary')?.style
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
        sx={stickyState}

      />
    </Box>
  );
};

export default DataGridList;
