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
  Collapse,
  styled,
} from "@mui/material";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import MenuIcon from "@mui/icons-material/Menu";
import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined";
import Diversity3Icon from "@mui/icons-material/Diversity3";
// import ModeOfTravelIcon from "@mui/icons-material/ModeOfTravel";
import RoomIcon from "@mui/icons-material/Room";
import EngineeringIcon from "@mui/icons-material/Engineering";
import RouteIcon from "@mui/icons-material/Route";
import CalculateIcon from "@mui/icons-material/Calculate";
import AssignmentIndRoundedIcon from '@mui/icons-material/AssignmentIndRounded';
import AssignmentTurnedInRoundedIcon from '@mui/icons-material/AssignmentTurnedInRounded';
import ScheduleIcon from '@mui/icons-material/Schedule';
import DirectionsBusIcon from "@mui/icons-material/DirectionsBus";
import BusinessIcon from "@mui/icons-material/Business";
import PowerSettingsNewIcon from "@mui/icons-material/PowerSettingsNew";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import PersonIcon from '@mui/icons-material/Person';
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import { useTheme, useMediaQuery } from "@mui/material";
import LogoutConfirmationModal from "./logoutModal";
import { companyListApi } from "../slices/appSlice";
import type { AppDispatch } from "../store/Store";
import { useDispatch } from "react-redux";

// Styled component for smooth transitions
const StableCollapse = styled(Collapse)({
  "&.MuiCollapse-hidden": {
    visibility: "visible",
  },
});

const Sidebar: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const location = useLocation();
  const { companyId } = useParams();
  const [isOpen, setIsOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isCompanySectionOpen, setIsCompanySectionOpen] = useState(false);
  const [companyName, setCompanyName] = useState("");
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const [userMenuOpen, setUserMenuOpen] = useState(false);

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
  // Updated fetchCompanyName useEffect
  useEffect(() => {
    const fetchCompanyName = async () => {
      if (companyId) {
        try {
          console.log("Fetching company name for ID:", companyId);
          const response = await dispatch(companyListApi({limit: 1,offset: 0, id: Number(companyId) })).unwrap();
          console.log("API Response:", response);
          const companies = response.data || response;
          const company = companies.find(
            (c: any) =>
              String(c.id) === String(companyId) || c._id === companyId
          );

          if (company) {
            console.log("Found company:", company);
            setCompanyName(company.name || company.companyName || "");
          } else {
            console.warn("Company not found in response");
            setCompanyName("");
          }
        } catch (error:any) {
          console.error(error.message||"Failed to fetch company list:");
          setCompanyName("");
        }
      } else {
        setCompanyName("");
      }
    };

    fetchCompanyName();
  }, [companyId, dispatch]);

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
            label: "Landmark",
            path: "/executive/landmark",
            icon: <RoomIcon />,
          },
          {
            label: "Global Fare",
            path: "/executive/global-fare",
            icon: <CalculateIcon />,
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
        icon: <CalculateIcon />,
      },
      {
        label: "Service",
        path: `/executive/company/service${companyId ? `/${companyId}` : ""}`,
        icon: <AssignmentIndRoundedIcon />,
      },

      {
        label:"Schedule"
        ,path:`/executive/company/schedule${companyId ? `/${companyId}` : ""}`
        ,icon:<ScheduleIcon/>
      },

      {
        label:"Duty"
        ,path:`/executive/company/duty${companyId ? `/${companyId}` : ""}`
        ,icon:<AssignmentTurnedInRoundedIcon/>
      },
      {
        label:"Statment"
        ,path:`/executive/company/statment${companyId ? `/${companyId}` : ""}`
        ,icon:<ReceiptLongIcon/>
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

                <ListItem disablePadding sx={{ flexDirection: "column" }}>
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
                      width: "100%",
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
                  {companyName && (
                    <Typography
                      variant="subtitle2"
                      sx={{
                        pl: 4,
                        py: 1,
                        color: "text.secondary",
                        fontWeight: "bold",
                        width: "100%",
                        textOverflow: "ellipsis",
                        overflow: "hidden",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {companyName}
                    </Typography>
                  )}
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

        <Box sx={{ px: 2, pt: 1, pb: 0, borderTop: "1px solid #eee", mt: "auto" }}>
          <List>
            <ListItem disablePadding>
              <ListItemButton
                onClick={() => setUserMenuOpen((prev) => !prev)}
                sx={{
                  borderRadius: 1,
                  minHeight: 40,
                  justifyContent: "center",
                  px: 1,
                  py: 0.5,
                }}
              >
                <ListItemIcon sx={{ minWidth: 32 }}>
                </ListItemIcon>
                <ListItemText
                  primary="User"
                  primaryTypographyProps={{
                    fontSize: "0.95rem",
                    fontWeight: 500,
                  }}
                  sx={{ m: 0 }}
                />
                {userMenuOpen ? <ExpandMore /> : <ExpandLess />}
              </ListItemButton>
            </ListItem>
            <Collapse in={userMenuOpen} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                <ListItem disablePadding>
                  <ListItemButton
                    onClick={() => {
                      navigate("/profile");
                      if (isSmallScreen) setIsOpen(false);
                      setUserMenuOpen(false);
                    }}
                    sx={{
                      pl: 4,
                      backgroundColor:
                        location.pathname === "/profile"
                          ? "primary.light"
                          : "inherit",
                      "&:hover": {
                        backgroundColor: "#E3F2FD",
                      },
                      borderRadius: 1,
                      mb: 1,
                      minHeight: 36,
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 32 }}>
                      <PersonIcon />
                    </ListItemIcon>
                    <ListItemText primary="Profile" />
                  </ListItemButton>
                </ListItem>
                <ListItem disablePadding>
                  <ListItemButton
                    onClick={() => {
                      setIsLogoutModalOpen(true);
                      setUserMenuOpen(false);
                    }}
                    sx={{ pl: 4, minHeight: 36 }}
                  >
                    <ListItemIcon sx={{ minWidth: 32 }}>
                      <PowerSettingsNewIcon color="error" />
                    </ListItemIcon>
                    <ListItemText primary="Logout" sx={{ color: "error.main" }} />
                  </ListItemButton>
                </ListItem>
              </List>
            </Collapse>
          </List>
        </Box>
        <Typography
          variant="caption"
          sx={{ textAlign: "center", mb: 1, color: "text.secondary" }}
        >
          &copy; {new Date().getFullYear()} EnteBus. All rights reserved.
          Version 0.1.3
        </Typography>
      </Drawer>

      <LogoutConfirmationModal
        open={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
      />
    </>
  );
};
export default React.memo(Sidebar);
