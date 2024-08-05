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

  const debouncedSearchTerms = useDebounce(searchTerms, 500); // Set the debounce delay to 500ms

  useEffect(() => {
    Object.keys(debouncedSearchTerms).forEach((index) => {
      updateColumnValues(index, filters[index].column, debouncedSearchTerms[index]);
    });
  }, [debouncedSearchTerms]);

  const updateColumnValues = async (index, columnName, search) => {
    try {
      const response = await axios.get(`http://localhost:3000/api/employees/${columnName}?search=${search}&page=1&limit=10`);
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
    setFilters([...filters, { column: 'name', operation: 'contains', value: [], logicalOperator: 'and' }]);
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
  };

  const handleSearchChange = (index, search) => {
    setSearchTerms((prev) => ({ ...prev, [index]: search }));
  };

  return (
    <Paper style={{ padding: 16, marginBottom: 16 }}>
      {filters.map((filter, index) => (
        <Grid container spacing={2} alignItems="center" key={`filter-${index}`}>
          <Grid item xs={3}>
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
          {/* <Grid item xs={2}>
            <TextField
              select
              label="Operation"
              value={filter.operation}
              onChange={(e) => handleChange(index, 'operation', e.target.value)}
              SelectProps={{
                native: true,
              }}
              size="small"
              fullWidth
            >
              <option value="equals">Equals</option>
              <option value="contains">Contains</option>
            </TextField>
          </Grid> */}
          <Grid item xs={4}>
            <Autocomplete
              multiple
              options={columnValues[index] || []}
              value={filter.value}
              onChange={(e, newValue) => handleChange(index, 'value', newValue)}
              getOptionLabel={(option) => option.label}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Value"
                  placeholder="Select values"
                  size="small"
                  onChange={(e) => handleSearchChange(index, e.target.value)}
                />
              )}
              renderOption={(props, option) => (
                <div {...props} key={option.id}>
                  <Checkbox
                    checked={filter.value.map((v) => v.id).includes(option.id)}
                    style={{ marginRight: 8 }}
                  />
                  <ListItemText primary={option.label} />
                </div>
              )}
            />
          </Grid>
          <Grid item xs={1}>
            <IconButton onClick={() => handleRemoveFilter(index)} size="small">
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Grid>
          {index > 0 && (
            <Grid item xs={2}>
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
        </Grid>
      ))}
      <Grid container justifyContent="space-between" alignItems="center" style={{ marginTop: 16 }}>
        <Button
          variant="contained"
          color="primary"
          onClick={handleAddFilter}
          startIcon={<AddCircleIcon />}
          size="small"
        >
          Add Filter
        </Button>
        <Button variant="outlined" color="secondary" onClick={onClearFilters} size="small">
          Clear All
        </Button>
        <Button variant="contained" color="primary" onClick={onApplyFilters} size="small">
          Apply Filters
        </Button>
      </Grid>
    </Paper>
  );
};

export default FilterComponent;
