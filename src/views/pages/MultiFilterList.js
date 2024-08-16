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

// const initialColumns = [
//   {
//     field: 'id',
//     headerName: 'ID',
//     width: 350,
//     headerClassName: 'stickyCells',
//     cellClassName: 'stickyCells',
//   },
//   { 
//     field: 'name',
//     headerName: 'Name',
//     width: 350,
//     headerClassName: '',
//     cellClassName: '',
//   },
//   { field: 'age', headerName: 'Age', width: 350 },
//   { field: 'salary', headerName: 'Salary', width: 350 },
// ];

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

  // const [columns, setColumns] = useState(initialColumns);

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

  // function CustomUserItem(props) {
  //   const { myCustomHandler, myCustomValue } = props;
  //   return (
  //     <MenuItem onClick={myCustomHandler}>
  //       <ListItemIcon>
  //         <PushPinIcon fontSize="small" />
  //       </ListItemIcon>
  //       <ListItemText>{myCustomValue}</ListItemText>
  //     </MenuItem>
  //   );
  // }

  // function CustomColumnMenu(props) {
  //   return (
  //     <GridColumnMenu
  //       {...props}
  //       slots={{
  //         // Add new item
  //         columnMenuUserItem: CustomUserItem,
  //       }}
  //       slotProps={{
  //         columnMenuUserItem: {
  //           // set `displayOrder` for new item
  //           displayOrder: 15,
  //           // pass additional props
  //           myCustomValue: 'Pin Column',
  //           myCustomHandler: () => {
  //             reorderColumn(props.colDef.field)
  //           } 
  //         },
  //       }}
  //     />
  //   );
  // }

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
    <div style={{ height: 600, width: '100%', margin:'20px 0px' }}>
      <Button
        variant="contained"
        color="primary"
        onClick={() => setShowFilter(!showFilter)}
        style={{ marginBottom: 16 }}
      >
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
        disableRowSelectionOnClick
        style={{ height: '450px' }}
        getRowClassName={params => 'fix-row'}
        sx={stickyState}
        
      />
    </div>
  );
};

export default MultiFilterList;

