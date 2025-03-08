import React, { useState } from "react";
import { Card, CardContent, CardActions, Typography, Button, Box, Dialog, DialogActions, DialogContent, DialogTitle, Avatar, Chip, Tooltip } from "@mui/material";
import { Diversity3 as Diversity3Icon } from "@mui/icons-material";
import { useAppDispatch } from "../../store/Hooks";
import { roleDeleteApi } from "../../slices/appSlice";
import localStorageHelper from "../../utils/localStorageHelper";
import RoleUpdateForm from "./RoleUpdate";
interface RoleCardProps {
  role: {
    id: number;
    name: string; 
    manageExecutive?: boolean;
    manageRole?: boolean;
    manageLandmark?: boolean;
    manageCompany?: boolean;
    manageVendor?: boolean;
    manageRoute?: boolean;
    manageSchedule?: boolean;
    manageService?: boolean;
    manageDuty?: boolean;
  };
  onBack: () => void; 
  onUpdate: (id: number) => void; 
  onDelete: (id: number) => void; 
  refreshList: (value:any)=>void;
  canManageRole: boolean;
}

const RoleDetailsCard: React.FC<RoleCardProps> = ({ role, onBack, onDelete, refreshList,canManageRole }) => {
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [updateFormOpen, setUpdateFormOpen] = useState(false);

  const dispatch = useAppDispatch();

  const handleRoleDelete = async () => {
      console.log("Deleting account...id----------------", role.id);
  
      if (!role.id) {
        console.error("Error: Account ID is missing");
        return;
      }
  
      try {
        console.log("Deleting account with ID================>:", role.id);
        const formData = new FormData();
        formData.append("id", String(role.id)); 

        // Pass the FormData object to the API
        const response = await dispatch(roleDeleteApi(formData)).unwrap();
        console.log("Account deleted:", response);
        setDeleteConfirmOpen(false);
        localStorageHelper.removeStoredItem(`account_${role.id}`);
        onDelete(role.id);
        refreshList('refresh');
      } catch (error) {
        console.error("Delete error:", error);
      }
    };

  return (
    <>
      {/* Role Details Card */}
      <Card sx={{ maxWidth: 420, margin: 2, boxShadow: 4, borderRadius: 3, p: 1 }}>
        
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", mb: 2 }}>
          <Avatar sx={{ bgcolor: "primary.main", width: 56, height: 56 }}>
            <Diversity3Icon fontSize="large" />
          </Avatar>
          <Typography variant="h6" sx={{ mt: 1, fontWeight: "bold" }}>
            {role.name} 
          </Typography>
        </Box>

        {/* Permissions Section */}
        <CardContent>
          <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: "bold" }}>
            Permissions:
          </Typography>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            {/* List all permissions */}
            <Chip label={`Manage Executive: ${role.manageExecutive ? "Yes" : "No"}`} color={role.manageExecutive ? "success" : "error"} variant="outlined" />
            <Chip label={`Manage Role: ${role.manageRole ? "Yes" : "No"}`} color={role.manageRole ? "success" : "error"} variant="outlined" />
            <Chip label={`Manage Landmark: ${role.manageLandmark ? "Yes" : "No"}`} color={role.manageLandmark ? "success" : "error"} variant="outlined" />
            <Chip label={`Manage Company: ${role.manageCompany ? "Yes" : "No"}`} color={role.manageCompany ? "success" : "error"} variant="outlined" />
            <Chip label={`Manage Vendor: ${role.manageVendor ? "Yes" : "No"}`} color={role.manageVendor ? "success" : "error"} variant="outlined" />
            <Chip label={`Manage Route: ${role.manageRoute ? "Yes" : "No"}`} color={role.manageRoute ? "success" : "error"} variant="outlined" />
            <Chip label={`Manage Schedule: ${role.manageSchedule ? "Yes" : "No"}`} color={role.manageSchedule ? "success" : "error"} variant="outlined" />
            <Chip label={`Manage Service: ${role.manageService ? "Yes" : "No"}`} color={role.manageService ? "success" : "error"} variant="outlined" />
            <Chip label={`Manage Duty: ${role.manageDuty ? "Yes" : "No"}`} color={role.manageDuty ? "success" : "error"} variant="outlined" />
          </Box>
        </CardContent>

        {/* Action Buttons */}
        <CardActions sx={{ justifyContent: "space-between", gap: 1 }}>
          <Button size="small" variant="contained" color="primary" onClick={onBack}>
            Back
          </Button>
          <Tooltip 
            title={!canManageRole ? "You don't have permission, contact the admin" : ""}
            arrow
            placement="top-start"
          >
            <span style={{ cursor: !canManageRole ? "not-allowed" : "default" }}> 
              <Button
                variant="contained"
                color="success"
                size="small"
                onClick={() => setUpdateFormOpen(true)}
               
                disabled={!canManageRole}
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
            title={!canManageRole ? "You don't have permission, contact the admin" : ""}
            arrow
            placement="top-start"
          >
            <span style={{ cursor: !canManageRole ? "not-allowed" : "default" }}> 
              <Button
                variant="contained"
                color="error"
                size="small"
                onClick={() => setDeleteConfirmOpen(true)}
                
                disabled={!canManageRole}
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

        </CardActions>
      </Card>

      {/* Delete Confirmation Modal */}
      <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this Role?</Typography>
          <Typography>
            <b>ID:</b> {role.id}, <b>Role Name:</b> {role.name}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={handleRoleDelete} color="error">
            Confirm Delete
          </Button>
        </DialogActions>
      </Dialog>


      {/* Update Form Modal */}
      <Dialog open={updateFormOpen} onClose={() => setUpdateFormOpen(false)} maxWidth="xs" fullWidth>
        <DialogContent>
          <RoleUpdateForm
            refreshList={(value:any)=>refreshList(value)}
            roleId={role.id} 
            onClose={() => setUpdateFormOpen(false)} 
          />
        </DialogContent>
      </Dialog>

      
    </>
  );
};

export default RoleDetailsCard;