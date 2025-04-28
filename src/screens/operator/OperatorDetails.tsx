import React, { useState } from "react";
import { Card, CardActions, Typography, Button, Box, Avatar, Dialog, DialogActions, DialogContent, DialogTitle, DialogContentText, Tooltip } from "@mui/material";
import {
  Delete as DeleteIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Person as PersonIcon
} from "@mui/icons-material";
import BadgeIcon from '@mui/icons-material/Badge';
import ToggleOnIcon from '@mui/icons-material/ToggleOn';
import ToggleOffIcon from '@mui/icons-material/ToggleOff';
import { useAppDispatch } from "../../store/Hooks";
import { operatorDeleteApi } from "../../slices/appSlice";
import localStorageHelper from "../../utils/localStorageHelper";
import OperatorUpdateForm from "./UpdationForm";

interface OperatorCardProps {
  operator: {
        id: number;
        companyId: number;
        companyName:string
        username: string;
        fullName: string;
        password: string;
        gender: string;
        email: string;
        phoneNumber: string;
        status: string;
        };
  
  onUpdate: () => void;
  onDelete: (id: number) => void;
  onBack: () => void;
  refreshList: (value: any) => void;
  canManageCompany: boolean;
  oncloseDetailCard: () => void
}

const OperatorDetailsCard: React.FC<OperatorCardProps> = ({
    operator,
  refreshList,
  onDelete,
  onBack,
  canManageCompany,
  oncloseDetailCard
}) => {
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [updateFormOpen, setUpdateFormOpen] = useState(false);
  const dispatch = useAppDispatch();
 
  const handleAccountDelete = async () => {
    if (!operator.id) {
      console.error("Error: Account ID is missing");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("id", String(operator.id));

      const response = await dispatch(operatorDeleteApi(formData)).unwrap();
      console.log("Account deleted:", response);

      setDeleteConfirmOpen(false);
      localStorageHelper.removeStoredItem(`account_${operator.id}`);
      onDelete(operator.id);
      refreshList("refresh");
    } catch (error) {
      console.error("Delete error:", error);
      
    }
  };

  return (
    <>
      <Card sx={{ maxWidth: 300, width: "100%", margin: "auto", boxShadow: 3, p: 2 }}>
        {/* User Avatar & Info */}
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", mb: 2 }}>
          <Avatar sx={{ width: 80, height: 80, bgcolor: "#187b48" }}>
            <BadgeIcon fontSize="large" />
          </Avatar>
          <Typography variant="h6" sx={{ mt: 1 }}>
            <b>{operator.fullName}</b>
          </Typography>
          <Typography variant="body2" color="textSecondary">
           <b>ID:</b>  {operator.id} | <b>username:</b> {operator.username}
          </Typography>
        </Box>

        {/* User Contact Info */}
        <Card sx={{ p: 2, bgcolor: "grey.100", mb: 2 }}>

        <Box sx={{ display: "flex", alignItems: "center", mb: 1 }} >
            <b>Full name:</b>
            {operator.fullName ? (
                <Typography variant="body2" color="textSecondary">
                  {operator.fullName}
                </Typography>
            ) : (
              <Typography variant="body2" color="textSecondary">
                Not added yet
              </Typography>
            )}
          </Box>

        <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
          <Typography variant="body2" color="textSecondary">
            <b>Company Name:</b> {operator.companyName}
          </Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
          <Typography variant="body2" color="textSecondary">
            <b>Company ID: </b> {operator.companyId}
          </Typography>
        </Box>
          <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
            <PhoneIcon color="action" sx={{ mr: 1 }} />
            {operator.phoneNumber ? (
              <a href={`tel:${operator.phoneNumber.replace("tel:", "")}`} style={{ textDecoration: "none" }}>
                <Typography variant="body2" color="primary">
                  {operator.phoneNumber.replace("tel:", "")}
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
            {operator.email ? (
              <a href={`mailto:${operator.email}`} style={{ textDecoration: "none" }}>
                <Typography variant="body2" color="primary">
                  {operator.email}
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
              {operator.gender ? operator.gender : "Not added yet"}
            </Typography>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", mb: 1, gap: 1 }}>
            {operator.status === "Active" ? (
              <>
                <ToggleOnIcon sx={{ color: "green", fontSize: 30 }} />
                <Typography sx={{ color: "green", fontWeight: "bold" }}>Active</Typography>
              </>
            ) : (
              <>
                <ToggleOffIcon sx={{ color: "#d93550", fontSize: 30 }} />
                <Typography sx={{ color: "#d93550", fontWeight: "bold" }}>Suspended</Typography>
              </>
            )}
          </Box>


        </Card>

        {/* Action Buttons */}
        <CardActions >
          <Box sx={{ display: "flex", gap: 1, justifyContent: "space-between" }}>
            <Button
              variant="outlined"
              color="primary"
              size="small"
              onClick={onBack}
              // startIcon={<BackIcon />}
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
                onClick={() => {
                  console.log("Update button clicked"); // Debugging
                  setUpdateFormOpen(true);
                }}
                // startIcon={<EditIcon />}
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
            <b>ID:</b> {operator.id}, <b>Username:</b> {operator.username}, <b>Full Name:</b>{" "}
            {operator.fullName}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={handleAccountDelete} color="error">
            Confirm Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Update Form Modal */}
      <Dialog open={updateFormOpen} onClose={() => setUpdateFormOpen(false)} maxWidth="xs" fullWidth>
        <DialogContent>
          <OperatorUpdateForm
            refreshList={(value: any) => refreshList(value)}
            operatorId={operator.id}
            onClose={() => setUpdateFormOpen(false)}
            onCloseDetailCard={oncloseDetailCard}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default OperatorDetailsCard;