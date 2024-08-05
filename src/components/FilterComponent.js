import React, { useState, useEffect } from 'react';
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

const FilterComponent = ({ filters, setFilters, onApplyFilters, onClearFilters }) => {
  const [columnValues, setColumnValues] = useState([[]]);
  const [searchTerms, setSearchTerms] = useState({});

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
    try {
      const response = await axios.get(`http://localhost:3000/api/employees/list?column=${columnName}&search=${search}&page=1&limit=10`);
      const uniqueValues = response.data.map(item => ({
        id: item[columnName],
        label: item[columnName].toString(),
      }));
      const newColumnValues = [...columnValues];
      newColumnValues[index] = uniqueValues;
      setColumnValues(newColumnValues);
    } catch (error) {
      console.error("Error fetching column values", error);
    }
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
  };

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
         
          <Grid item xs={6} sm={6} md={filters.length > 1? 6 : 8}>
            <Autocomplete
              multiple
              limitTags={3}
              size="small"
              options={columnValues[index] || []}
              value={filter.value}
              onChange={(e, newValue) => handleChange(index, 'value', newValue)}
              getOptionLabel={(option) => option.label}
              isOptionEqualToValue={(option, value) => option.id === value.id}

              disableCloseOnSelect
              renderOption={(props, option) => {
                const { key, ...optionProps } = props;
                return (
                  <li key={key} {...optionProps}>
                    <Checkbox
                      // icon={icon}
                      // checkedIcon={checkedIcon}
                      style={{ marginRight: 8 }}
                      checked={filter.value.map((v) => v.id).includes(option.id)}
                    />
                    <ListItemText primary={option.label} />

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
