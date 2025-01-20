import { Box, Drawer, List, ListItem, ListItemIcon, ListItemButton, ListItemText, Typography, Divider } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import Diversity3Icon from '@mui/icons-material/Diversity3';
import ModeOfTravelIcon from '@mui/icons-material/ModeOfTravel';
import EngineeringIcon from '@mui/icons-material/Engineering';
import RouteIcon from '@mui/icons-material/Route';
import CorporateFareIcon from '@mui/icons-material/CorporateFare';
import DirectionsBusIcon from '@mui/icons-material/DirectionsBus';

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const sections = [
    {
      title: 'Executives',
      items: [
        { label: 'Account', path: '/account', icon: <AccountCircleOutlinedIcon /> },
        { label: 'Role', path: '/exerole', icon: <Diversity3Icon /> },
        { label: 'Bus Stop', path: '/busstop', icon: <ModeOfTravelIcon /> },

      ],
    },
    {
      title: 'company',
      items: [
        { label: 'Operator', path: '/opertaor', icon: <EngineeringIcon /> },
        { label: 'Role', path: '/companyrole', icon: <Diversity3Icon /> },
        { label: 'Route', path: '/busroute', icon: <RouteIcon /> },
        { label: 'fare', path: '/fare',  icon: <CorporateFareIcon /> },
        { label: 'Bus', path: '/bus', icon: <DirectionsBusIcon /> },
      ],
    },
  ];

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: 240,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: 240,
          boxSizing: 'border-box',
        },
      }}
    >   
    {/* **************companyname************** */}
      <Box
        sx={{
          textAlign: 'center',
          p: 2,
          bgcolor: 'darkblue',
          color: 'white',
        }}
      >
        <Typography variant="h5" fontWeight="bold">
          EnteBus
        </Typography>
      </Box>

      <Divider />
      {/* **************nav items *******************************/}
      <Box sx={{ overflow: 'auto', p: 2, }}>  {/* **************bgcolor:'rgb(167, 167, 236)'************** */}
        {sections.map((section, index) => (
          <Box key={index} sx={{ mb: 3 }}>
            <Typography variant="h6" sx={{ mb: 1 }}>
              {section.title}
            </Typography>
            <List>
              {section.items.map((item, idx) => (
                <ListItem key={idx} disablePadding>
                  <ListItemButton onClick={() => navigate(item.path)} 
                     sx={{
                      backgroundColor:
                        location.pathname === item.path ? 'primary.light' : 'inherit',
                      '&:hover': {
                        backgroundColor: 'primary.light',
                      },
                      '&.Mui-selected': {
                        backgroundColor: 'primary.main',
                        color: 'white',
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
    </Drawer>
  );
};

export default Sidebar;
