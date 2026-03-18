// // src/pages/Coins/CoinsPage.jsx
// import React, { useState } from "react";
// import { Tabs, Tab, Box } from "@mui/material";
// import CoinPackagesTab from "./components/CoinPackagesTab";
// import OffersTab from "./components/OffersTab";
// import CallRatesTab from "./components/CallRatesTab";

// const CoinsPage = () => {
//   const [tab, setTab] = useState(0);

//   return (
//     <Box className="p-6">
//       <h1 className="text-2xl font-bold mb-6">Coins & Offers</h1>

//       <Tabs value={tab} onChange={(e, v) => setTab(v)}>
//         <Tab label="Call Rates" />
//         <Tab label="Coin Packages" />
//         <Tab label="Offers" />
//       </Tabs>

//       <Box className="mt-6">
//         {tab === 0 && <CallRatesTab />}
//         {tab === 1 && <CoinPackagesTab />}
//         {tab === 2 && <OffersTab />} 
//       </Box>
//     </Box>
//   );
// };

// export default CoinsPage;

// src/pages/Coins/CoinsPage.jsx
import React, { useState } from "react";
import { Tabs, Tab, Box, Paper, Typography, Container } from "@mui/material";
import PhoneIcon from '@mui/icons-material/Phone';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import CoinPackagesTab from "./components/CoinPackagesTab";
import OffersTab from "./components/OffersTab";
import CallRatesTab from "./components/CallRatesTab";

const CoinsPage = () => {
  const [tab, setTab] = useState(0);

  return (
    <Box sx={{ bgcolor: '#f5f7fa', height: 'calc(107vh - 64px)', overflowY: 'auto', overflowX: 'hidden', py: 4 }}>
      <Container maxWidth="xl">
        {/* Header */}
        <Box mb={4}>
          <Typography variant="h4" fontWeight="700" gutterBottom>
            Coins & Offers Management
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage call rates, coin packages, and promotional offers
          </Typography>
        </Box>

        {/* Tabs */}
        <Paper elevation={0} sx={{ borderRadius: 2, overflow: 'hidden', mb: 3 }}>
          <Tabs 
            value={tab} 
            onChange={(e, v) => setTab(v)}
            sx={{ 
              bgcolor: 'white',
              '& .MuiTab-root': {
                minHeight: 64,
                textTransform: 'none',
                fontSize: '1rem',
                fontWeight: 500,
              }
            }}
            TabIndicatorProps={{
              style: { height: 3 }
            }}
          >
            <Tab 
              icon={<PhoneIcon />} 
              iconPosition="start"
              label="Call Rates" 
            />
            <Tab 
              icon={<AccountBalanceWalletIcon />} 
              iconPosition="start"
              label="Coin Packages" 
            />
            <Tab 
              icon={<LocalOfferIcon />} 
              iconPosition="start"
              label="Offers" 
            />
          </Tabs>
        </Paper>

        {/* Tab Content */}
        <Box>
          {tab === 0 && <CallRatesTab />}
          {tab === 1 && <CoinPackagesTab />}
          {tab === 2 && <OffersTab />}
        </Box>
      </Container>
    </Box>
  );
};

export default CoinsPage;