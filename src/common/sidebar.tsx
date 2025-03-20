import React, { useState } from "react";
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemButton,
  ListItemText,
  Typography,
  Divider,
  IconButton,
} from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import MenuIcon from "@mui/icons-material/Menu";
import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined";
import Diversity3Icon from "@mui/icons-material/Diversity3";
import ModeOfTravelIcon from "@mui/icons-material/ModeOfTravel";
import RoomIcon from "@mui/icons-material/Room";
import EngineeringIcon from "@mui/icons-material/Engineering";
import RouteIcon from "@mui/icons-material/Route";
import CorporateFareIcon from "@mui/icons-material/CorporateFare";
import DirectionsBusIcon from "@mui/icons-material/DirectionsBus";
import BusinessIcon from '@mui/icons-material/Business';
import PowerSettingsNewIcon from "@mui/icons-material/PowerSettingsNew";
import { useTheme, useMediaQuery } from "@mui/material";
import LogoutConfirmationModal from "./logoutModal";

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  const sections = [
    {
      title: "Executives",
      items: [
        {
          label: "Account",
          path: "/account",
          icon: <AccountCircleOutlinedIcon />,
        },
        { label: "Role", path: "/exerole", icon: <Diversity3Icon /> },
        { label: "Land mark", path: "/landmark", icon: <RoomIcon /> },
        { label: "Bus Stop", path: "/busstop", icon: <ModeOfTravelIcon /> },
      ],
    },
    {
      title: "Company",
      items: [
        { label: "company", path: "/company", icon: <BusinessIcon /> },
        { label: "Operator", path: "/operator", icon: <EngineeringIcon /> },
        { label: "Bus", path: "/bus", icon: <DirectionsBusIcon /> },
        { label: "Role", path: "/companyrole", icon: <Diversity3Icon /> },
        { label: "Route", path: "/busroute", icon: <RouteIcon /> },
        { label: "Fare", path: "/fare", icon: <CorporateFareIcon /> },
        
      ],
    },
  ];

  return (
    <>
      {/******************************************  Toggle Button for Small Screens**************************************************/}
      {isSmallScreen && (
        <IconButton
          color="inherit"
          aria-label="open drawer"
          edge="start"
          onClick={() => setIsOpen(true)}
          sx={{
            position: "absolute",
            top: 16,
            left: 16,
            zIndex: theme.zIndex.drawer + 1,
          }}
        >
          <MenuIcon />
        </IconButton>
      )}

      {/****************************************************  SidebarDrawer *************************************************/}
      <Drawer
        variant={isSmallScreen ? "temporary" : "permanent"} // Switch variant based on screen size
        open={isSmallScreen ? isOpen : true} // Open state for small screens
        onClose={() => setIsOpen(false)} // Close sidebar for small screens
        sx={{
          width: isSmallScreen ? "auto" : 240,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: 240,
            boxSizing: "border-box",
          },
        }}
      >
        {/* Company Name */}
        <Box
          sx={{
            textAlign: "center",
            p: 2,
            bgcolor: "darkblue",
            color: "white",
          }}
        >
          <Typography
            variant="h5"
            fontWeight="bold"
            fontSize={{ xs: "1rem", sm: "1.5rem" }}
          >
            EnteBus
          </Typography>
        </Box>
        <Divider />

        {/* Navigation Items */}
        <Box sx={{ overflow: "auto", p: 2 }}>
          {sections.map((section, index) => (
            <Box key={index} sx={{ mb: 3 }}>
              <Typography variant="h6" sx={{ mb: 1 }}>
                {section.title}
              </Typography>
              <List>
                {section.items.map((item, idx) => (
                  <ListItem key={idx} disablePadding>
                    <ListItemButton
                      onClick={() => {
                        navigate(item.path);
                        if (isSmallScreen) setIsOpen(false); // Close sidebar on navigation for small screens
                      }}
                      sx={{
                        backgroundColor:
                          location.pathname === item.path
                            ? "primary.light"
                            : "inherit",
                        "&:hover": {
                          backgroundColor: "#E3F2FD",
                        },
                        "&.Mui-selected": {
                          backgroundColor: "primary.main",
                          color: "white",
                        },
                      }}
                    >
                      <ListItemIcon>{item.icon}</ListItemIcon>
                      <ListItemText primary={item.label} />
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
              {index < sections.length - 1 && <Divider />}
            </Box>
          ))}
        </Box>

        {/* *******************************************************logout section******************************************************** */}
        <Box sx={{ mt: "auto", p: 2 }}>
          <List>
            <ListItem disablePadding>
              <ListItemButton onClick={() => setIsLogoutModalOpen(true)}>
                <ListItemIcon>
                  <PowerSettingsNewIcon color="error" />
                </ListItemIcon>
                <ListItemText primary="Logout" sx={{ color: "error.main" }} />
              </ListItemButton>
            </ListItem>
          </List>
        </Box>
      </Drawer>

      <LogoutConfirmationModal
        open={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
      />
    </>
  );
};

export default Sidebar;
