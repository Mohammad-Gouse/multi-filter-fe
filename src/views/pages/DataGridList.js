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

const DataGridList = () => {

  const [data, setData] = useState([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);

  const [columns, setColumns] = useState(initialColumns);
  const [pinText, setPinText] = useState('Pin')
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
  
// const [isPin, setIsPin] = useState(false)

  // const reorderColumn = (field) => {
  //   setColumns(prevColumns => {
  //     const columnToMove = prevColumns.find(col => col.field === field);
  //     const otherColumns = prevColumns.filter(col => col.field !== field);

  //     const updatedColumns = [
  //       {
  //         ...columnToMove,
  //         headerClassName: 'stickyCells',
  //         cellClassName: 'stickyCells',
  //       },
  //       ...otherColumns.map(col => ({
  //         ...col,
  //         headerClassName: '',
  //         cellClassName: '',
  //       }))
  //     ];

  //     return updatedColumns;
  //   });
  // };



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

    let max = -1
    let maxField = ''
    for (let i=0; i<allColumnState.length; i++){
      if(allColumnState[i].style.left > max){
        max = allColumnState[i].style.left
        maxField = allColumnState[i].field
      }
    }

    const deletedColumn = allColumnState.filter(col => col.field === field)

    const deletedColumnState = {}
    deletedColumnState['left'] = deletedColumn[0]?.style?.left
    
    const maxLeftColumn = allColumnState.filter(col => col.field === maxField)


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
          boxShadow: '4px 0px 6px -2px rgba(0, 0, 0, 0.1)',
        } : {}
        
      }
    })


    reorderColumnSticky(field)

    const currentPin = allColumnState.filter(column => column.isPin).length;
    const currentUnpin = allColumnState.filter(column => !column.isPin).length;

    if(currentPin > 1){
      reorderIfExistMore(currentPin, currentUnpin, field, deletedColumn, maxLeftColumn, deletedColumnState)
    }{
      reorderIfExistOne()
    }
    
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

  function reorderIfExistMore(currentPin, currentUnpin, field, deletedColumn, maxLeftColumn, deletedColumnState){
    setCountPin(currentPin)
    setCountUnPin(currentUnpin)

    console.log(columns, allColumnState)

    if ( (currentPin < countPin)){

      if(deletedColumn[0].field == maxLeftColumn[0].field){
        return
      }
      allColumnState.forEach((col)=>{
        if(col.isPin && col.style?.left >= 350){
          col.style.left -= 350
        }
      })

    
      // if(deletedColumn[0].field != maxLeftColumn[0].field){

      //   allColumnState.forEach((col)=>{
      //     if (col.field == maxLeftColumn[0].field){
      //       col.style.left = deletedColumnState.left
      //       console.log(col.style.left, deletedColumn[0], deletedColumnState.left)
      //     }
      //   })
      // }

    }


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

      // console.log(pinColumns)
      const reorderedColumns = [...pinColumns, ...unPinColumns];

      // allColumnState.forEach((col, index)=>{
      //   if(col.isPin){
      //     col.style.left = 0
      //   }
      // })

      // let left = 0
      // for(let i = 0; i<allColumnState.length; i++){
      //   if (allColumnState[i].isPin){
      //     allColumnState[i].style.left = left
      //     left += 350
      //   }
      // }

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

  const stickyState = {
    '& .idClass': allColumnState.find(column => column.field === 'id')?.style,
    '& .nameClass': allColumnState.find(column => column.field === 'name')?.style,
    '& .ageClass': allColumnState.find(column => column.field === 'age')?.style,
    '& .salaryClass': allColumnState.find(column => column.field === 'salary')?.style,
    '& .fix-row': {
                    '&:hover': {
                      backgroundColor: 'rgb(245,245,247)',
                      '& .MuiDataGrid-cell:first-child': {
                        backgroundColor: 'rgb(245,245,247)'
                      },
                      '& .MuiDataGrid-cell:nth-child(2)': {
                        backgroundColor: 'rgb(245,245,247)'
                      },
                      '& .MuiDataGrid-cell:nth-child(3)': {
                        backgroundColor: 'rgb(245,245,247)'
                      },
                      '& .MuiDataGrid-cell:nth-child(4)': {
                        backgroundColor: 'rgb(245,245,247)'
                      }
                    },
                  },
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
        columnBuffer={columns.length}
        getRowClassName={params => 'fix-row'}
        sx={stickyState}
        disableRowSelectionOnClick 
      />
    </Box>
  );
};

export default DataGridList;
