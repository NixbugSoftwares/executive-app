import React from "react";
import { Card, CardContent, CardActions, Typography, Button, Box } from "@mui/material";



interface RoleCardProps {
    role:{
        id: number;
        rolename: string;
        manageexecutive: boolean;
        managerole: boolean;
        managelandmark: boolean;
        managecompany: boolean;
    };
    onUpdate: (id: number)=> void;
    onDelete: (id: number)=> void;
    onBack: () => void;
}


const RoleDetailsCard: React.FC<RoleCardProps> = ({
    role,
    onBack,
    onDelete,
    onUpdate

}) =>{
    return(
        <Card sx={{maxWidth: 400, margin: 2, boxShadow: 3}}>
                  <CardContent>
               
                    <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                      <Typography variant="h6">{role.rolename}</Typography>
                    </Box>
            
               
                    <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                      <Typography variant="body2" color="textSecondary">
                       <b>Manage Executive</b>: {role.manageexecutive}
                      </Typography>
                    </Box>
            
                    <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                      <Typography variant="body2" color="textSecondary">
                        <b>Manage Role:</b> {role.managerole}
                      </Typography>
                    </Box>
            
    
                    <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                      <Typography variant="body2" color="textSecondary">
                        <b>Manage Landmark:</b>{role.managelandmark}
                      </Typography>
                    </Box>
            
                 
                    <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                      <Typography variant="body2" color="textSecondary">
                        <b>Manage Company:</b> {role.managecompany}
                      </Typography>
                    </Box>
            
                  </CardContent>

            <CardActions sx={{ justifyContent: "space-between" }}>
                <Box sx={{ display: "flex", gap: 1 }}>
                    {/* Back Button */}
                    <Button
                        variant="outlined"
                        color="primary"
                        onClick={onBack}
                       
                    >
                        Back
                    </Button>

                    <Button
                        variant="contained"
                        color="success"
                        onClick={() => onUpdate(role.id)}
                    >
                        Update
                    </Button>


                    <Button
                        variant="contained"
                        color="error"
                        onClick={() => onDelete(role.id)}
                    >
                        Delete
                    </Button>
                </Box>
            </CardActions>

        </Card>
    )
}

export default RoleDetailsCard