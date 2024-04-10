import React, { useState } from 'react';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';
import './SimulationForm.css';
import Select from 'react-dropdown-select';
import { useNavigate } from 'react-router-dom';

const SimulationForm = () => {
  const [formData, setFormData] = useState({
    temp_start: 0,
    temp_end: 50,
    humidity_start: 0,
    humidity_end: 100,
    polling_rate_seconds: 10,
    noise_mean: 0.0,
    noise_std: 1.0,
    time_interval: 1,
    time_unit: 'seconds',
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    let value;
    if (e.target.name === 'noise_mean' || e.target.name === 'noise_std') {
      value = parseFloat(e.target.value);
    } else if (e.target.name === 'polling_rate_seconds' ) {
      value = parseInt(e.target.value, 10);
    } else {
      value = e.target.value;
    }
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleSliderChange = (name, value) => {
    if (name === 'temp_start') {
      setFormData({ ...formData, temp_start: value[0], temp_end: value[1] });
    } else if (name === 'temp_end') {
      setFormData({ ...formData, temp_end: value[1] });
    } else if (name === 'humidity_start') {
      setFormData({ ...formData, humidity_start: value[0], humidity_end: value[1] });
    } else if (name === 'humidity_end') {
      setFormData({ ...formData, humidity_end: value[1] });
    }
  };

  const handleDropdownChange = (selectedOption) => {
    if (selectedOption && selectedOption.length > 0) {
      const selectedValue = selectedOption[0].value;
      setFormData({ ...formData, time_unit: selectedValue });
    }
  };
  
  const handlePollingRateChange = (selectedOption) => {
    if (selectedOption && selectedOption.length > 0) {
      const selectedValue = selectedOption[0].value;
      setFormData({ ...formData, polling_rate_seconds: selectedValue });
    }
  };
  
  

  const timeUnitOptions = [
    { value: 'seconds', label: 'Seconds' },
    { value: 'minutes', label: 'Minutes' },
    { value: 'hours', label: 'Hours' },
    { value: 'days', label: 'Days' },
    { value: 'weeks', label: 'Weeks' },
    { value: 'months', label: 'Months' },
  ];

  const [simulatedData, setSimulatedData] = useState(null);
  const [graphHtml, setGraphHtml] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/simulate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          ...formData,
        }),
      });
      const data = await response.json();
  
      if (response.ok) {
        setSimulatedData(data);
      } else {
        console.error('Error:', data.error);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };
  

  const generateJsonFile = (data) => {
    const dataStr = JSON.stringify(data, null, 2); 
    const blob = new Blob([dataStr], { type: 'application/json' }); 
    const url = URL.createObjectURL(blob); 
    const link = document.createElement('a'); 
    link.href = url; 
    link.download = 'simulated_data.json'; 
    link.click(); 
    URL.revokeObjectURL(url); 
  };

  const pollingRateOptions = [
    { value: 10, label: '10 seconds' },
    { value: 30, label: '30 seconds' },
    { value: 60, label: '1 minute' },
    { value: 300, label: '5 minutes' },
    { value: 600, label: '10 minutes' },
  ];

  const generateGraph = async () => {
    try {
      // Example POST request sending formData
      const response = await fetch('/api/generate-graph', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData), // Adjust formData as needed
      });
      const data = await response.json();
  
      if (response.ok) {
        // Assuming the response contains the path or filename of the generated graph
        const graphPath = data.graphPath; // Adjust this line based on your actual response structure
  
        // Option 1: Navigate to a new page showing the graph (you need to set up routing for this)
        // navigate(`/path-to-graph-display/${graphPath}`);
  
        // Option 2: Open the graph in a new tab/window
        window.open(`${process.env.PUBLIC_URL}/path/to/generated/graphs/${graphPath}`, '_blank');
      } else {
        console.error('Failed to generate graph');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };


  return (
    <div>
    <form onSubmit={handleSubmit}>
    <div className="time-input-container">
        <label>
          Time Interval:
          <input
            type="number"
            name="time_interval"
            value={formData.time_interval}
            onChange={handleChange}
          />
        </label>
        <label>
        Time Unit:
        <Select
             options={timeUnitOptions}
             value={timeUnitOptions.find((option) => option.value === formData.time_unit)}
             onChange={handleDropdownChange}
          />
        </label>
      </div>
      <label>
        Temperature Range:
        <Slider
          range
          min={0}
          max={50}
          value={[formData.temp_start, formData.temp_end]}
          onChange={(value) => handleSliderChange('temp_start', value)}
        />
        <div>
          Start: {formData.temp_start} &deg;C, End: {formData.temp_end} &deg;C
        </div>
      </label>
      <label>
        Humidity Range:
        <Slider
          range
          min={0}
          max={100}
          value={[formData.humidity_start, formData.humidity_end]}
          onChange={(value) => handleSliderChange('humidity_start', value)}
        />
        <div>
          Start: {formData.humidity_start}%, End: {formData.humidity_end}%
        </div>
      </label>
      <label>
        Polling Rate:
        <Select
          options={pollingRateOptions}
          value={pollingRateOptions.find((option) => option.value === formData.polling_rate_seconds)}
          onChange={(selectedOption) => handlePollingRateChange(selectedOption)}
        />
      </label>
      <label>
        Noise Mean:
        <input
          type="number"
          name="noise_mean"
          value={formData.noise_mean}
          onChange={handleChange}
        />
      </label>
      <label>
        Noise Standard Deviation:
        <input
          type="number"
          name="noise_std"
          value={formData.noise_std}
          onChange={handleChange}
        />
      </label>
      <button type="submit">Generate Data</button>
    </form>
    <button type="button" onClick={() => simulatedData && generateJsonFile(simulatedData)}>
       Download JSON File
    </button>
    <button type="button" onClick={generateGraph}>Generate Graph</button>
   </div>
    
  );



};

export default SimulationForm;