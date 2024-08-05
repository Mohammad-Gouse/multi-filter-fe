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

const FilterComponent = ({ filters, setFilters, onClearFilters }) => {
  const [columnValues, setColumnValues] = useState([[]]);
  const [searchTerm, setSearchTerm] = useState('');

  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  useEffect(() => {
    if (filters.length === 1) {
      updateColumnValues(0, filters[0].column);
    }
  }, [filters]);

  useEffect(() => {
    updateColumnValues(filters.length - 1, filters[filters.length - 1].column);
  }, [debouncedSearchTerm]);

  const updateColumnValues = async (index, columnName) => {
    try {
      const response = await axios.get(`http://localhost:3000/api/employees/${columnName}?search=${debouncedSearchTerm}&page=1&limit=10`);
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
    setFilters([...filters, { column: 'name', operation: 'contains', value: [], logicalOperator: filters[0].logicalOperator }]);
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
      updateColumnValues(index, value);
    }
    if (field === 'logicalOperator' && index === 0) {
      const updatedFilters = newFilters.map((filter, i) => ({
        ...filter,
        logicalOperator: i === 0 ? value : filters[0].logicalOperator
      }));
      setFilters(updatedFilters);
    }
    if (field === 'value') {
      setSearchTerm(value);
    }
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
          <Grid item xs={4}>
            <Autocomplete
              multiple
              options={columnValues[index] || []}
              value={filter.value}
              onChange={(e, newValue) => handleChange(index, 'value', newValue)}
              getOptionLabel={(option) => option.label}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              renderInput={(params) => (
                <TextField {...params} label="Value" placeholder="Select values" size="small" />
              )}
              renderOption={(props, option) => (
                <li {...props} key={option.id}>
                  <Checkbox
                    checked={filter.value.map((v) => v.id).includes(option.id)}
                    style={{ marginRight: 8 }}
                  />
                  <ListItemText primary={option.label} />
                </li>
              )}
            />
          </Grid>
          <Grid item xs={1}>
            <IconButton onClick={() => handleRemoveFilter(index)} size="small">
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Grid>
          <Grid item xs={2}>
            <TextField
              select
              label="Logical Operator"
              value={filter.logicalOperator}
              onChange={(e) => handleChange(0, 'logicalOperator', e.target.value)} // Only the first filter can change the logical operator
              SelectProps={{
                native: true,
              }}
              size="small"
              fullWidth
              disabled={index !== 0} // Disable logical operator selection for all but the first filter
            >
              <option value="and">AND</option>
              <option value="or">OR</option>
            </TextField>
          </Grid>
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
      </Grid>
    </Paper>
  );
};

export default FilterComponent;
