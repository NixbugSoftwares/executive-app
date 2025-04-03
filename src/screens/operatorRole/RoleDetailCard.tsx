import React, { useState } from "react";
import { Card, CardContent, CardActions, Typography, Button, Box, Dialog, DialogActions, DialogContent, DialogTitle, Avatar, Chip, Tooltip } from "@mui/material";
import { Diversity3 as Diversity3Icon } from "@mui/icons-material";
import { useAppDispatch } from "../../store/Hooks";
import { operatorRoleDeleteApi } from "../../slices/appSlice";
import localStorageHelper from "../../utils/localStorageHelper";
import RoleUpdateForm from "./RoleUpdate";
interface RoleCardProps {
  role: {
    id: number;
    name: string; 
    companyId: number;
    companyName:string
    manage_bus?: boolean;
    manage_route?: boolean;
    manage_schedule?: boolean;
    manage_role?: boolean;
    manage_operator?: boolean;
    manage_company?: boolean;
  };
  onBack: () => void; 
  onUpdate: (id: number) => void; 
  onDelete: (id: number) => void; 
  refreshList: (value:any)=>void;
  canManageCompany: boolean;
}

const RoleDetailsCard: React.FC<RoleCardProps> = ({ role, onBack, onDelete, refreshList,canManageCompany }) => {
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [updateFormOpen, setUpdateFormOpen] = useState(false);

  const dispatch = useAppDispatch();

  const handleRoleDelete = async () => {
      console.log("Deleting role...id----------------", role.id);
  
      if (!role.id) {
        console.error("Error: role ID is missing");
        return;
      }
  
      try {
        console.log("Deleting role with ID================>:", role.id);
        const formData = new FormData();
        formData.append("id", String(role.id)); 

        // Pass the FormData object to the API
        const response = await dispatch(operatorRoleDeleteApi(formData)).unwrap();
        console.log("Account deleted:", response);
        setDeleteConfirmOpen(false);
        localStorageHelper.removeStoredItem(`role_${role.id}`);
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
          <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
            <Typography variant="body2" color="textSecondary">
              <b>Role ID:</b> {role.id}
            </Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
            <Typography variant="body2" color="textSecondary">
              <b>Company Name: </b> {role.companyName}
            </Typography>
          </Box>
           <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
            <Typography variant="body2" color="textSecondary">
              <b>Company ID: </b> {role.companyId}
            </Typography>
          </Box>
          <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: "bold" }}>
            Permissions:
          </Typography>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            {/* List all permissions */}
            <Chip label={`Manage Executive: ${role.manage_bus ? "Yes" : "No"}`} color={role.manage_bus ? "success" : "error"} variant="outlined" />
            <Chip label={`Manage Role: ${role.manage_route ? "Yes" : "No"}`} color={role.manage_route ? "success" : "error"} variant="outlined" />
            <Chip label={`Manage Landmark: ${role.manage_schedule ? "Yes" : "No"}`} color={role.manage_schedule ? "success" : "error"} variant="outlined" />
            <Chip label={`Manage Company: ${role.manage_role ? "Yes" : "No"}`} color={role.manage_role ? "success" : "error"} variant="outlined" />
            <Chip label={`Manage Vendor: ${role.manage_operator ? "Yes" : "No"}`} color={role.manage_operator ? "success" : "error"} variant="outlined" />
            <Chip label={`Manage Route: ${role.manage_company ? "Yes" : "No"}`} color={role.manage_company ? "success" : "error"} variant="outlined" />
          </Box>
        </CardContent>

        {/* Action Buttons */}
        <CardActions sx={{ justifyContent: "space-between", gap: 1 }}>
          <Button size="small" variant="contained" color="primary" onClick={onBack}>
            Back
          </Button>
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
                onClick={() => setUpdateFormOpen(true)}
               
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