import { Box, TextField, Stack, Typography, Button } from "@mui/material";
import React, { useState } from "react";

const AddLocationDataPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    lng: 0,
    lat: 0,
  });

  const handleLinkMapChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;

    const coordsMatch = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);

    if (coordsMatch) {
      setFormData({
        ...formData,
        lat: parseFloat(coordsMatch[1]),
        lng: parseFloat(coordsMatch[2]),
      });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const jsonOutput = JSON.stringify(formData, null, 2);

    console.log("Data yang dikirim (JSON):", jsonOutput);
  };

  return (
    <Box sx={{ p: 4, maxWidth: 500 }}>
      <h2>Add Location Data</h2>
      <form onSubmit={handleSubmit}>
        <Stack spacing={3}>
          <TextField
            label="Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            fullWidth
          />

          <TextField
            label="Category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            fullWidth
          />

          <TextField
            label="Link Map"
            placeholder="Paste Google Maps URL here..."
            onChange={handleLinkMapChange}
            fullWidth
            helperText="Tempel link dari browser (contoh: yang mengandung @-6.xxx,107.xxx)"
          />

          <Stack direction="row" spacing={2}>
            <TextField
              label="Latitude"
              value={formData.lat}
              disabled
              fullWidth
              color="success"
              focused={!!formData.lat}
            />
            <TextField
              label="Longitude"
              value={formData.lng}
              disabled
              fullWidth
              color="success"
              focused={!!formData.lng}
            />
          </Stack>
        </Stack>
        <Button
          type="submit"
          variant="contained"
          color="primary"
          sx={{ mt: 2 }}
        >
          Submit Data
        </Button>
      </form>
    </Box>
  );
};

export default AddLocationDataPage;
