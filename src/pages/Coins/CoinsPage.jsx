// src/pages/Coins/CoinsPage.jsx
import React, { useState } from "react";
import { Tabs, Tab, Box } from "@mui/material";
import CoinPackagesTab from "./components/CoinPackagesTab";
import OffersTab from "./components/OffersTab";

const CoinsPage = () => {
  const [tab, setTab] = useState(0);

  return (
    <Box className="p-6">
      <h1 className="text-2xl font-bold mb-6">Coins & Offers</h1>

      <Tabs value={tab} onChange={(e, v) => setTab(v)}>
        <Tab label="Coin Packages" />
        <Tab label="Offers" />
      </Tabs>

      <Box className="mt-6">
        {tab === 0 && <CoinPackagesTab />}
        {tab === 1 && <OffersTab />}
      </Box>
    </Box>
  );
};

export default CoinsPage;
