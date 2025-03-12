import React, { useState } from "react";
import { Card, CardActions, Typography, Button, Box, Avatar, Dialog, DialogActions, DialogContent, DialogTitle, DialogContentText, Tooltip } from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  ArrowBack as BackIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  AccountCircle as UserIcon,
  Person as PersonIcon,
} from "@mui/icons-material";
import { useAppDispatch } from "../../store/Hooks";
import { companyDeleteApi } from "../../slices/appSlice";
import localStorageHelper from "../../utils/localStorageHelper";
// import OperatorUpdateForm from "./UpdationForm";

interface companyCardProps {
    company: {
    id: number;
    name: string;
    ownerName: string;
    location: string;
    phoneNumber: string;
    address: string;
    email: string;
    status: string;
        };
  
  onUpdate: () => void;
  onDelete: (id: number) => void;
  onBack: () => void;
  refreshList: (value: any) => void;
  canManageCompany: boolean;
}

const companyDetailsCard: React.FC<companyCardProps> = ({
    company,
  refreshList,
  onDelete,
  onBack,
  canManageCompany,
}) => {
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  // const [updateFormOpen, setUpdateFormOpen] = useState(false);
  const dispatch = useAppDispatch();
 
  const handleCompanyDelete = async () => {
    if (!company.id) {
      console.error("Error: Account ID is missing");
      return;
    }
  
    try {
      const formData = new FormData();
      formData.append("id", String(company.id));
  
      const response = await dispatch(companyDeleteApi(formData)).unwrap();
      console.log("Account deleted:", response);
  
      setDeleteConfirmOpen(false);
      localStorageHelper.removeStoredItem(`company_${company.id}`);
      onDelete(company.id);
      refreshList("refresh");
    } catch (error) {
      console.error("Delete error:", error);
    }
  };

  return (
    <>
      <Card sx={{ maxWidth: 450, width: "100%", margin: "auto", boxShadow: 3, p: 2 }}>
        {/* User Avatar & Info */}
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", mb: 2 }}>
          <Avatar sx={{ width: 80, height: 80, bgcolor: "darkblue" }}>
            <UserIcon fontSize="large" />
          </Avatar>
          <Typography variant="h6" sx={{ mt: 1 }}>
            {company.name}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            ID: {company.id} | @{company.ownerName}
          </Typography>
        </Box>

        {/* User Contact Info */}
        <Card sx={{ p: 2, bgcolor: "grey.100", mb: 2 }}>

        <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
          <Typography variant="body2" color="textSecondary">
            Address: {company.location} 
          </Typography>

          </Box>
          <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
            <PhoneIcon color="action" sx={{ mr: 1 }} />
            {company.phoneNumber ? (
              <a href={`tel:${company.phoneNumber.replace("tel:", "")}`} style={{ textDecoration: "none" }}>
                <Typography variant="body2" color="primary">
                  {company.phoneNumber.replace("tel:", "")}
                </Typography>
              </a>
            ) : (
              <Typography variant="body2" color="textSecondary">
                Not added yet
              </Typography>
            )}
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
            <EmailIcon color="action" sx={{ mr: 1 }} />
            {company.email ? (
              <a href={`mailto:${company.email}`} style={{ textDecoration: "none" }}>
                <Typography variant="body2" color="primary">
                  {company.email}
                </Typography>
              </a>
            ) : (
              <Typography variant="body2" color="textSecondary">
                Not added yet
              </Typography>
            )}
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
            <PersonIcon color="action" sx={{ mr: 1 }} />
            <Typography variant="body2">
              {company.status }
            </Typography>
          </Box>
        </Card>

        {/* Action Buttons */}
        <CardActions sx={{ justifyContent: "space-between" }}>
          <Box sx={{ display: "flex", gap: 1 }}>
            <Button
              variant="outlined"
              color="primary"
              size="small"
              onClick={onBack}
              startIcon={<BackIcon />}
            >
              Back
            </Button>

            {/* Update Button with Tooltip */}
            <Tooltip 
              title={!canManageCompany ? "You don't have permission, contact the admin" : ""}
              arrow
              placement="top-start"
            >
              <span style={{ cursor: !canManageCompany ? "not-allowed" : "default" }}> 
              <Button
                variant="contained"
                color="success"
                size="small"
                // onClick={() => {
                //   console.log("Update button clicked"); // Debugging
                //   setUpdateFormOpen(true);
                // }}
                startIcon={<EditIcon />}
                disabled={!canManageCompany}
                sx={{
                  "&.Mui-disabled": { 
                    backgroundColor: "#81c784 !important",
                    color: "#ffffff99", 
                  }
                }}
              >
                Update
              </Button>

              </span>
            </Tooltip>
            
            {/* Delete Button with Tooltip */}
            <Tooltip 
              title={!canManageCompany ? "You don't have permission, contact the admin" : ""}
              arrow
              placement="top-start"
            >
              <span style={{ cursor: !canManageCompany ? "not-allowed" : "default" }}> 
                <Button
                  variant="contained"
                  color="error"
                  size="small"
                  onClick={() => setDeleteConfirmOpen(true)}
                  startIcon={<DeleteIcon />}
                  disabled={!canManageCompany}
                  sx={{
                    "&.Mui-disabled": { 
                      backgroundColor: "#e57373 !important", 
                      color: "#ffffff99", 
                    }
                  }}
                >
                  Delete
                </Button>
              </span>
            </Tooltip>
          </Box>
        </CardActions>
      </Card>

      {/* Delete Confirmation Modal */}
      <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>Are you sure you want to delete this account?</DialogContentText>
          <Typography>
            <b>ID:</b> {company.id}, <b>Comapany name:</b> {company.name}, 
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={handleCompanyDelete} color="error">
            Confirm Delete
          </Button>
        </DialogActions>
      </Dialog> 

  
   {/* <Dialog open={updateFormOpen} onClose={() => setUpdateFormOpen(false)} maxWidth="xs" fullWidth>
        <DialogContent>
          <OperatorUpdateForm
            refreshList={(value: any) => refreshList(value)}
            operatorId={operator.id}
            onClose={() => setUpdateFormOpen(false)}
          />
        </DialogContent>
      </Dialog> */}
    </>
  );
};

export default companyDetailsCard;