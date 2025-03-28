import React, { useState, useEffect, useCallback, useMemo } from "react";
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
  Avatar,
  Collapse,
  styled,
} from "@mui/material";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import MenuIcon from "@mui/icons-material/Menu";
import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined";
import Diversity3Icon from "@mui/icons-material/Diversity3";
import ModeOfTravelIcon from "@mui/icons-material/ModeOfTravel";
import RoomIcon from "@mui/icons-material/Room";
import EngineeringIcon from "@mui/icons-material/Engineering";
import RouteIcon from "@mui/icons-material/Route";
import CorporateFareIcon from "@mui/icons-material/CorporateFare";
import DirectionsBusIcon from "@mui/icons-material/DirectionsBus";
import BusinessIcon from "@mui/icons-material/Business";
import PowerSettingsNewIcon from "@mui/icons-material/PowerSettingsNew";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import { useTheme, useMediaQuery } from "@mui/material";
import LogoutConfirmationModal from "./logoutModal";
import LoggedInUser from "./UserDetails";

// Styled component for smooth transitions
const StableCollapse = styled(Collapse)({
  transition: "height 267ms cubic-bezier(0.4, 0, 0.2, 1) 0ms",
  "&.MuiCollapse-hidden": {
    visibility: "visible", // Prevents visual glitches
  },
});

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { companyId } = useParams();
  const [isOpen, setIsOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isUserSectionOpen, setIsUserSectionOpen] = useState(false);
  const [isCompanySectionOpen, setIsCompanySectionOpen] = useState(false);
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  // Memoized company check
  const isCompanySelected = useMemo(
    () =>
      Boolean(companyId) ||
      location.pathname.startsWith("/executive/company/operator") ||
      location.pathname.startsWith("/executive/company/role") ||
      location.pathname.startsWith("/executive/company/bus") ||
      location.pathname.startsWith("/executive/company/busroute") ||
      location.pathname.startsWith("/executive/company/fare"),
    [companyId, location.pathname]
  );

  // Stable sections data
  const sections = useMemo(
    () => [
      {
        title: "Executives",
        items: [
          {
            label: "Account",
            path: "/executive/account",
            icon: <AccountCircleOutlinedIcon />,
          },
          { label: "Role", path: "/executive/role", icon: <Diversity3Icon /> },
          {
            label: "Land mark",
            path: "/executive/landmark",
            icon: <RoomIcon />,
          },
          {
            label: "Bus Stop",
            path: "/executive/busstop",
            icon: <ModeOfTravelIcon />,
          },
        ],
      },
    ],
    []
  );

  // Memoized company items
  const companyItems = useMemo(
    () => [
      {
        label: "Operator",
        path: `/executive/company/operator${companyId ? `/${companyId}` : ""}`,
        icon: <EngineeringIcon />,
      },
      {
        label: "Role",
        path: `/executive/company/role${companyId ? `/${companyId}` : ""}`,
        icon: <Diversity3Icon />,
      },
      {
        label: "Bus",
        path: `/executive/company/bus${companyId ? `/${companyId}` : ""}`,
        icon: <DirectionsBusIcon />,
      },
      {
        label: "Route",
        path: `/executive/company/busroute${companyId ? `/${companyId}` : ""}`,
        icon: <RouteIcon />,
      },
      {
        label: "Fare",
        path: `/executive/company/fare${companyId ? `/${companyId}` : ""}`,
        icon: <CorporateFareIcon />,
      },
    ],
    [companyId]
  );

  // Stable click handlers
  const handleCompanyClick = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      const isSamePage = location.pathname === "/executive/company";
      navigate("/executive/company");
      setIsCompanySectionOpen((prev) => (isSamePage ? !prev : true));

      if (isSmallScreen) setIsOpen(false);
    },
    [location.pathname, navigate, isSmallScreen]
  );

  const handleNavigation = useCallback(
    (path: string) => {
      navigate(path);
      if (isSmallScreen) setIsOpen(false);
    },
    [navigate, isSmallScreen]
  );

  // Effect for company section state
  useEffect(() => {
    setIsCompanySectionOpen(isCompanySelected);
  }, [isCompanySelected]);

  // Memoized list items to prevent unnecessary re-renders
  const renderCompanyItems = useMemo(
    () =>
      companyItems.map((item) => {
        const isActive = location.pathname.startsWith(item.path.split("?")[0]);
        return (
          <ListItem key={item.path} disablePadding sx={{ pl: 4 }}>
            <ListItemButton
              onClick={() => handleNavigation(item.path)}
              sx={{
                backgroundColor: isActive ? "#e3f2fd" : "inherit",
                color: isActive ? "#1976d2" : "inherit",
                "&:hover": {
                  backgroundColor: isActive ? "#bbdefb" : "#f5f5f5",
                },
              }}
            >
              <ListItemIcon sx={{ color: isActive ? "#1976d2" : "inherit" }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.label}
                primaryTypographyProps={{
                  fontWeight: isActive ? "bold" : "normal",
                }}
              />
            </ListItemButton>
          </ListItem>
        );
      }),
    [companyItems, location.pathname, handleNavigation]
  );

  return (
    <>
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

      <Drawer
        variant={isSmallScreen ? "temporary" : "permanent"}
        open={isSmallScreen ? isOpen : true}
        onClose={() => setIsOpen(false)}
        sx={{
          width: isSmallScreen ? "auto" : 240,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: 240,
            boxSizing: "border-box",
          },
        }}
      >
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

        <Box sx={{ overflow: "auto", p: 2 }}>
          {sections.map((section, index) => (
            <Box key={index} sx={{ mb: 3 }}>
              <Typography variant="h6" sx={{ mb: 1 }}>
                {section.title}
              </Typography>
              <List>
                {section.items.map((item) => (
                  <ListItem key={item.path} disablePadding>
                    <ListItemButton
                      onClick={() => handleNavigation(item.path)}
                      sx={{
                        backgroundColor:
                          location.pathname === item.path
                            ? "primary.light"
                            : "inherit",
                        "&:hover": {
                          backgroundColor: "#E3F2FD",
                        },
                      }}
                    >
                      <ListItemIcon>{item.icon}</ListItemIcon>
                      <ListItemText primary={item.label} />
                    </ListItemButton>
                  </ListItem>
                ))}

                <ListItem disablePadding>
                  <ListItemButton
                    onClick={handleCompanyClick}
                    sx={{
                      backgroundColor: location.pathname.startsWith(
                        "/executive/company"
                      )
                        ? "primary.light"
                        : "inherit",
                      "&:hover": {
                        backgroundColor: "#E3F2FD",
                      },
                    }}
                  >
                    <ListItemIcon>
                      <BusinessIcon />
                    </ListItemIcon>
                    <ListItemText primary="Company" />
                    {isCompanySelected &&
                      (isCompanySectionOpen ? (
                        <ExpandLessIcon />
                      ) : (
                        <ExpandMoreIcon />
                      ))}
                  </ListItemButton>
                </ListItem>

                <StableCollapse
                  in={isCompanySectionOpen && isCompanySelected}
                  timeout="auto"
                  unmountOnExit={false}
                >
                  <List component="div" disablePadding>
                    {renderCompanyItems}
                  </List>
                </StableCollapse>
              </List>
              {index < sections.length - 1 && <Divider />}
            </Box>
          ))}
        </Box>

        <Box sx={{ mt: "auto", p: 2 }}>
          <List>
            <ListItem disablePadding>
              <ListItemButton
                onClick={() => setIsUserSectionOpen(!isUserSectionOpen)}
              >
                <ListItemIcon>
                  <Avatar sx={{ bgcolor: "primary.main" }}>
                    <AccountCircleOutlinedIcon />
                  </Avatar>
                </ListItemIcon>
                <ListItemText primary="User" />
                {isUserSectionOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </ListItemButton>
            </ListItem>

            <Collapse in={isUserSectionOpen} timeout="auto" unmountOnExit>
              <Box sx={{ pl: 4, pr: 2 }}>
                <LoggedInUser />
                <ListItem disablePadding>
                  <ListItemButton onClick={() => setIsLogoutModalOpen(true)}>
                    <ListItemIcon>
                      <PowerSettingsNewIcon color="error" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Logout"
                      sx={{ color: "error.main" }}
                    />
                  </ListItemButton>
                </ListItem>
              </Box>
            </Collapse>
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

export default React.memo(Sidebar);
