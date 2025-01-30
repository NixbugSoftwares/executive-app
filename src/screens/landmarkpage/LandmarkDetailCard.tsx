import React from "react";
import { Card, CardContent, CardActions, Typography, Button, Box } from "@mui/material";



interface LandmarkCardProps {
    landmark:{
        id: number;
        name: string;
        location: string;
        status: "verified" | "unverified";
        importance: "low" | "medium" | "high";
    };
    onUpdate: (id: number)=> void;
    onDelete: (id: number)=> void;
    onBack: () => void;
}


const RoleDetailsCard: React.FC<LandmarkCardProps> = ({
    landmark,
    onBack,
    onDelete,
    onUpdate

}) =>{
    return(
        <Card sx={{maxWidth: 400, margin: 2, boxShadow: 3}}>
                  <CardContent>
                   
                    <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                      <Typography variant="h6">{landmark.name}</Typography>
                    </Box>
            
                    
                    <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                      <Typography variant="body2" color="textSecondary">
                       <b>Location</b>: {landmark.location}
                      </Typography>
                    </Box>
            
             
                    <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                      <Typography variant="body2" color="textSecondary">
                        <b>Status:</b> {landmark.status}
                      </Typography>
                    </Box>
            
                    
                    <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                      <Typography variant="body2" color="textSecondary">
                        <b>Importance:</b>{landmark.importance}
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

                    {/* Update Button */}
                    <Button
                        variant="contained"
                        color="success"
                        onClick={() => onUpdate(landmark.id)}
                    >
                        Update
                    </Button>

                    {/* Delete Button */}
                    <Button
                        variant="contained"
                        color="error"
                        onClick={() => onDelete(landmark.id)}
                    >
                        Delete
                    </Button>
                </Box>
            </CardActions>

        </Card>
    )
}

export default RoleDetailsCard