import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Box,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import RoleDetailsCard from "./RoleDetailCard";
import RoleCreatingForm from "./RoleCreatingForm";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "../../store/Store";
import { roleListApi } from "../../slices/appSlice";
import { useSelector } from "react-redux";
import { RootState } from "../../store/Store";
import { showErrorToast } from "../../common/toastMessageHelper";
import PaginationControls from "../../common/paginationControl";
import FormModal from "../../common/formModal";
import { RoleDetails } from "../../types/type";



interface Role {
  id: number;
  name: string;
  roleDetails: RoleDetails;
}

const RoleListingTable = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [roleList, setRoleList] = useState<Role[]>([]);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [search, setSearch] = useState({ id: "", Rolename: "" });
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  const [page, setPage] = useState(0);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const debounceRef = useRef<number | null>(null);
  const rowsPerPage = 10;
  const canManageRole = useSelector((state: RootState) =>
    state.app.permissions.includes("manage_executive")
  );

  const fetchRoleList = useCallback(
    (pageNumber: number, searchParams = {}) => {
      setIsLoading(true);
      const offset = pageNumber * rowsPerPage;
      dispatch(roleListApi({ limit: rowsPerPage, offset, ...searchParams }))
        .unwrap()
        .then((res) => {
          const items = res.data || [];
          const formattedRoleList = items.map((role: any) => ({
            id: role.id,
            name: role.name,
            roleDetails: {
              manage_executive: role.manage_executive,
              manage_role: role.manage_role,
              manage_landmark: role.manage_landmark,
              manage_company: role.manage_company,
              manage_vendor: role.manage_vendor,
              manage_route: role.manage_route,
              manage_schedule: role.manage_schedule,
              manage_service: role.manage_service,
              manage_duty: role.manage_duty,
              manage_fare: role.manage_fare,
            },
          }));
          setRoleList(formattedRoleList);
          setHasNextPage(items.length === rowsPerPage);
        })
        .catch((errorMessage) => {
    showErrorToast(errorMessage); // errorMessage is already a string
  })
  .finally(() => {
    setIsLoading(false);
  });
    },
    [dispatch]
  );

  const handleSearchChange = useCallback(
    (
      e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
      column: keyof typeof search
    ) => {
      const value = e.target.value;
      setSearch((prev) => ({ ...prev, [column]: value }));

      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = window.setTimeout(() => {
        setDebouncedSearch((prev) => ({ ...prev, [column]: value }));
        setPage(0);
      }, 700);
    },
    []
  );

  const handleChangePage = useCallback(
    (_: React.MouseEvent<HTMLButtonElement> | null, newPage: number) => {
      setPage(newPage);
    },
    []
  );
  const handleRowClick = (role: Role) => setSelectedRole(role);

  useEffect(() => {
    const searchParams = {
      ...(debouncedSearch.id && { id: debouncedSearch.id }),
      ...(debouncedSearch.Rolename && { name: debouncedSearch.Rolename }),
    };
    fetchRoleList(page, searchParams);
  }, [page, debouncedSearch, fetchRoleList]);

  const tableHeaders = [
    { key: "id", label: "ID" },
    { key: "Rolename", label: "Name" },
  ];
  const permissionKeys = [
    "Executive",
    "Role",
    "Landmark",
    "Company",
    "Vendor",
    "Route",
    "Schedule",
    "Service",
    "Duty",
    "Fare",
  ];

  const permissionFields = [
    "manage_executive",
    "manage_role",
    "manage_landmark",
    "manage_company",
    "manage_vendor",
    "manage_route",
    "manage_schedule",
    "manage_service",
    "manage_duty",
    "manage_fare",
  ];

  const refreshList = (value: string) => {
    if (value === "refresh") {
      fetchRoleList(page, debouncedSearch);
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: { xs: "column", md: "row" },
        width: "100%",
        height: "100vh",
        gap: 2,
      }}
    >
      {/* Table Section */}
      <Box
        sx={{
          flex: selectedRole ? { xs: "0 0 100%", md: "0 0 65%" } : "0 0 100%",
          maxWidth: selectedRole ? { xs: "100%", md: "65%" } : "100%",
          transition: "all 0.3s ease",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        <Tooltip
          title={
            !canManageRole
              ? "You don't have permission, contact the admin"
              : "Click to open the role creation form"
          }
          placement="top-end"
        >
          <Button
            sx={{
              ml: "auto",
              mr: 2,
              mb: 2,
              display: "block",
              backgroundColor: !canManageRole
                ? "#6c87b7 !important"
                : "#00008B",
              color: "white",
              "&.Mui-disabled": {
                backgroundColor: "#6c87b7 !important",
                color: "#ffffff99",
              },
            }}
            variant="contained"
            disabled={!canManageRole}
            onClick={() => setOpenCreateModal(true)}
            style={{ cursor: !canManageRole ? "not-allowed" : "default" }}
          >
            Add New Role
          </Button>
        </Tooltip>

        <TableContainer
          sx={{
            flex: 1,
            maxHeight: "calc(100vh - 100px)",
            overflowY: "auto",
            borderRadius: 2,
            border: "1px solid #e0e0e0",
          }}
        >
          <Table stickyHeader>
            <TableHead>
              <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                {tableHeaders.map(({ key, label }) => (
                  <TableCell key={key}>
                    <b style={{ display: "block", textAlign: "center" }}>
                      {label}
                    </b>
                    <TextField
                      variant="outlined"
                      size="small"
                      placeholder="Search"
                      value={search[key as keyof typeof search]}
                      onChange={(e) =>
                        handleSearchChange(e, key as keyof typeof search)
                      }
                      fullWidth
                      sx={{
                        "& .MuiInputBase-root": {
                          height: 40,
                          fontSize: selectedRole ? "0.8rem" : "1rem",
                        },
                        "& .MuiInputBase-input": {
                          textAlign: "center",
                        },
                      }}
                    />
                  </TableCell>
                ))}
                {permissionKeys.map((perm) => (
                  <TableCell key={perm} align="center">
                    <b>Manage {perm}</b>
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {roleList.length > 0 ? (
                roleList.map((row) => {
                  const isSelected = selectedRole?.id === row.id;
                  return (
                    <TableRow
                      key={row.id}
                      hover
                      onClick={() => handleRowClick(row)}
                      sx={{
                        cursor: "pointer",
                        backgroundColor: isSelected ? "#E3F2FD" : "inherit",
                      }}
                    >
                      <TableCell>{row.id}</TableCell>
                      <TableCell>
                          <Tooltip title={row.name} placement="bottom">
                            <Typography noWrap>
                              {row.name.length > 15
                                ? `${row.name.substring(0, 15)}...`
                                : row.name}
                            </Typography>
                          </Tooltip>
                       
                          
                      </TableCell>
                      {permissionFields.map((key) => (
                        <TableCell key={key} align="center">
                          {row.roleDetails && row.roleDetails[key as keyof RoleDetails] ? (
                            <CheckCircleIcon sx={{ color: "#228B22" }} />
                          ) : (
                            <CancelIcon sx={{ color: "#DE3163" }} />
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={10} align="center">
                    No roles found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <PaginationControls
          page={page}
          onPageChange={(newPage) => handleChangePage(null, newPage)}
          isLoading={isLoading}
          hasNextPage={hasNextPage}
        />
      </Box>

      {/* Side Panel for Role Details */}
      {selectedRole && (
        <Box
          sx={{
            flex: { xs: "0 0 100%", md: "0 0 30%" },
            maxWidth: { xs: "100%", md: "30%" },
            transition: "all 0.3s ease",
            bgcolor: "grey.100",
            p: 2,
            mt: { xs: 2, md: 0 },
            overflowY: "auto",
            overflowX: "hidden",
            height: "100%",
          }}
        >
          <RoleDetailsCard
            role={selectedRole}
            onBack={() => setSelectedRole(null)}
            onUpdate={() => {}}
            onDelete={() => {}}
            refreshList={(value: any) => refreshList(value)}
            canManageRole={canManageRole}
            handleCloseDetailCard={() => setSelectedRole(null)}
            onCloseDetailCard={() => setSelectedRole(null)}
          />
        </Box>
      )}

      <FormModal
        open={openCreateModal}
        onClose={() => setOpenCreateModal(false)}
      >
        <RoleCreatingForm
          refreshList={refreshList}
          onClose={() => setOpenCreateModal(false)}
        />
      </FormModal>
    </Box>
  );
};

export default RoleListingTable;
