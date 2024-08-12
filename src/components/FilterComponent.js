import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  TextField,
  Grid,
  Paper,
  IconButton,
  Button,
  Checkbox,
  ListItemText,
} from '@mui/material';
import { AddCircle as AddCircleIcon, Delete as DeleteIcon } from '@mui/icons-material';
import Autocomplete from '@mui/material/Autocomplete';
import axios from 'axios';
import useDebounce from '@/hooks/useDebounce';
import { lime } from '@mui/material/colors';

const FilterComponent = ({ filters, setFilters, onApplyFilters, onClearFilters }) => {
  const [columnValues, setColumnValues] = useState([[]]);

  const [namesList, setNamesList] = useState([])
  const [agesList, setAgesList] = useState([])
  const [salarysList, setSalaryList] = useState([])
  const [idList, setIdList] = useState([])

  const [searchTerms, setSearchTerms] = useState({});
  const [limit, setLimit] = useState(10);
  const [pageNumber, setPageNumber] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [hasMore, setHasMore] = useState(true)


  useEffect(() => {
    if (filters.length === 1) {
      updateColumnValues(0, filters[0].column, '');
    }
  }, [filters]);

  const debouncedSearchTerms = useDebounce(searchTerms, 99);

  useEffect(() => {
    Object.keys(debouncedSearchTerms).forEach((index) => {
      updateColumnValues(index, filters[index].column, debouncedSearchTerms[index]);
    });
  }, [debouncedSearchTerms]);


  const updateColumnValues = async (index, columnName, search) => {
    setLoading(true)
    setError(false)
    try {
      let cancel
      const response = await axios({
        method: 'GET',
        url: `http://localhost:3000/api/employees/list`,
        params: { column: columnName, search: search, limit: 10, page: pageNumber },
        cancelToken: new axios.CancelToken(c => cancel = c)
      })

      // const response = await axios.get(`http://localhost:3000/api/employees/list?column=${columnName}&search=${search}&page=1&limit=${limit}`);

      //updating data with id and labels and the data is already coming unique from backend
      // const uniqueValues = response.data.map(item => ({
      //   label: item[columnName].toString(),
      // }));

      const uniqueValues = response.data.map(item => (item[columnName].toString()));

      if (uniqueValues.length > 0) {
        setHasMore(true)
      } else {
        console.log('data not found')
        setHasMore(false)
        return
      }

      const newColumnValues = [...columnValues];

      console.log(columnName)

      switch (columnName) {
        case 'id':
          setIdList([...new Set([...idList, ...uniqueValues])])
          newColumnValues[index] = [...new Set([...idList, ...uniqueValues])]
          break
        case 'name':
          setNamesList([...new Set([...namesList, ...uniqueValues])])
          newColumnValues[index] = [...new Set([...namesList, ...uniqueValues])]
          break
        case 'age':
          setAgesList([...new Set([...agesList, ...uniqueValues])])
          newColumnValues[index] = [...new Set([...agesList, ...uniqueValues])]
          break
        case 'salary':
          setSalaryList([...new Set([...salarysList, ...uniqueValues])])
          newColumnValues[index] = [...new Set([...salarysList, ...uniqueValues])]
          break

      }


      //newcolumnValues is 2D array which stores Multiple Filter data in array
      // const newColumnValues = [...columnValues]; 

      //Adding or appending new values coming from backend after updating with id and labels in specify index of 2D array
      // newColumnValues[index] = uniqueValues;
      //appending and destructuing here

      // newColumnValues[index] = [...new Set([...newColumnValues[index], ...uniqueValues])]

      //set 2d array with updated values
      setColumnValues(newColumnValues);
    } catch (error) {
      console.error("Error fetching column values", error);
      setError(true)
      setLoading(false)
    }
    setLoading(false)
    return () => cancel()
  };


  const handleAddFilter = () => {
    setFilters([...filters, { column: 'name', operation: 'contains', value: [], logicalOperator: filters[0]?.logicalOperator }]);
    setColumnValues([...columnValues, []]);
  };

  const handleRemoveFilter = (index) => {
    const newFilters = filters.filter((_, i) => i !== index);
    const newColumnValues = columnValues.filter((_, i) => i !== index);
    setFilters(newFilters);
    setColumnValues(newColumnValues);
  };

  const handleChange = (index, field, value) => {
    const newFilters = [...filters];
    newFilters[index][field] = value;
    setFilters(newFilters);
    if (field === 'column') {
      setPageNumber(1)
      updateColumnValues(index, value, '');
    }

    if (field === 'logicalOperator' && index === 0) {
      const updatedFilters = newFilters.map((filter, i) => ({
        ...filter,
        logicalOperator: i === 0 ? value : filters[0]?.logicalOperator
      }));
      setFilters(updatedFilters)
    }
  };

  const handleSearchChange = (index, search) => {
    setSearchTerms((prev) => ({ ...prev, [index]: search }));
    setPageNumber(1)
  };

  const handleScroll = (index, event, column) => {
    const bottom = (Math.floor(event.target.scrollHeight - event.target.scrollTop) <= Math.floor(event.target.clientHeight));

    console.log(bottom, hasMore)
    if (bottom && hasMore) {
      setPageNumber(prevPage => prevPage + 1)
      updateColumnValues(index, column, '')
    }
  }

  return (
    <Paper style={{ padding: 16, marginBottom: 16, position: 'absolute', minWidth: '60vw', zIndex: 1 }}>
      {filters.map((filter, index) => (
        <Grid container spacing={2} alignItems="center" key={`filter-${index}`} style={{ marginBottom: '15px' }}>
          {index === 0 && filters.length > 1 && (
            <Grid item xs={6} sm={6} md={2}>
              <TextField
                select
                label="Logical Operator"
                value={filter.logicalOperator}
                onChange={(e) => handleChange(index, 'logicalOperator', e.target.value)}
                SelectProps={{
                  native: true,
                }}
                size="small"
                fullWidth
              >
                <option value="and">AND</option>
                <option value="or">OR</option>
              </TextField>
            </Grid>
          )}
          {index !== 0 && filters.length > 1 && (
            <Grid item xs={6} sm={6} md={2}>
              <TextField
                select
                label="Logical Operator"
                value={filter.logicalOperator}
                onChange={(e) => handleChange(index, 'logicalOperator', e.target.value)}
                SelectProps={{
                  native: true,
                }}
                size="small"
                fullWidth
                disabled
              >
                <option value="and">AND</option>
                <option value="or">OR</option>
              </TextField>
            </Grid>
          )}
          <Grid item xs={6} sm={6} md={3}>
            <TextField
              select
              label="Column"
              value={filter.column}
              id="column"
              onChange={(e) => handleChange(index, 'column', e.target.value)}
              SelectProps={{
                native: true,
              }}
              size="small"
              fullWidth
            >
              <option value="id">ID</option>
              <option value="name">Name</option>
              <option value="age">Age</option>
              <option value="salary">Salary</option>
            </TextField>
          </Grid>

          <Grid item xs={6} sm={6} md={filters.length > 1 ? 6 : 8}>
            <Autocomplete
              loading
              multiple
              limitTags={3}
              size="small"
              options={columnValues[index] || []}
              value={filter.value}
              onChange={(e, newValue) => handleChange(index, 'value', newValue)}
              getOptionLabel={(option) => option}
              isOptionEqualToValue={(option, value) => option === value}
              ListboxProps={{
                onScroll: (event) => handleScroll(index, event, filter.column)
              }}
              disableCloseOnSelect
              renderOption={(props, option) => {
                const { key, ...optionProps } = props;
                return (
                  <li key={key} {...optionProps}>
                    <Checkbox
                      // icon={icon}
                      // checkedIcon={checkedIcon}
                      style={{ marginRight: 8 }}
                      checked={filter.value.includes(option)}
                    />
                    <ListItemText primary={option} />
                  </li>
                );
              }}
              renderInput={(params) => (
                <TextField
                  fullWidth
                  {...params}
                  label="Value"
                  placeholder="Select values"
                  size="small"
                  onChange={(e) => handleSearchChange(index, e.target.value)} />
              )}
            />

            {/* <Autocomplete
      loading
      multiple
      limitTags={3}
      size="small"
      options={columnValues[index] || []}
      value={filter.value}
      onChange={(e, newValue) => handleChange(index, 'value', newValue)}
      getOptionLabel={(option) => option}
      isOptionEqualToValue={(option, value) => option === value}
      // ListboxProps={{
      //   onScroll: (event) => handleScroll(index, event, filter.column),
      // }}
      disableCloseOnSelect
      renderOption={(props, option, optionIndex) => {
        const { key, ...optionProps } = props;
        const isLastOption = optionIndex.index === columnValues[index].length - 1;


        return (
          <li
            key={key}
            {...optionProps}
            ref={isLastOption ? lastOptionRef : null}
          >
            <Checkbox
              style={{ marginRight: 8 }}
              checked={filter.value.includes(option)}
            />
            <ListItemText primary={option} />
          </li>
        );
      }}
      renderInput={(params) => (
        <TextField
          fullWidth
          {...params}
          label="Value"
          placeholder="Select values"
          size="small"
          onChange={(e) => handleSearchChange(index, e.target.value)}
        />
      )}
    /> */}
          </Grid>

          <Grid item xs={1} sm={1} md={1}>
            <IconButton onClick={() => handleRemoveFilter(index)} size="small">
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Grid>

        </Grid>
      ))}
      <Grid container justifyContent="start" alignItems="center" style={{ marginTop: 16 }}>
        <Button
          variant="contained"
          color="primary"
          onClick={handleAddFilter}
          startIcon={<AddCircleIcon />}
          size="small"
          style={{ marginRight: 10 }}
        >
          Add Filter
        </Button>
        <Button variant="outlined" color="secondary" onClick={onClearFilters} size="small">
          Clear All
        </Button>
      </Grid>
    </Paper>
  );
};

export default FilterComponent;
