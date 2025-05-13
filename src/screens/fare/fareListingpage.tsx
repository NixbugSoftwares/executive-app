import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Box,
  Button,
  Paper,
  Typography,
  TextField,
  Tooltip,
} from "@mui/material";
import { useDispatch } from "react-redux";
import ErrorIcon from "@mui/icons-material/Error";
import { fareListApi } from "../../slices/appSlice";
import CodeEditor from "../fare/textEditor";
import type { AppDispatch } from "../../store/Store";
import { showErrorToast } from "../../common/toastMessageHelper";

interface Fare {
  id: number;
  name: string;
  company_id: number | null;
  version: number;
  function: string;
  scope: number;
  starts_at: string;
  expires_on: string;
  updated_on: string;
  created_on: string;
  attributes: {
    df_version: number;
    ticket_types: string[];
    currency_type: string;
    distance_unit: string;
    extra: Record<string, any>;
  };
}

const FareListingPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [fareList, setFareList] = useState<Fare[]>([]);
  const [selectedFare, setSelectedFare] = useState<Fare | null>(null);
  const [editableCode, setEditableCode] = useState<string>("");
  const [output, setOutput] = useState<string>("");
  const [search, setSearch] = useState({
    id: "",
    name: "",
  });
  const [page, setPage] = useState(0);
  const rowsPerPage = 10;

  const fetchGlobalFares = () => {
    dispatch(fareListApi({ scope: 1 }))
      .unwrap()
      .then((res: any) => {
        const formattedFares = res.data.map((fare: any) => ({
          id: fare.id,
          name: fare.name,
          company_id: fare.company_id,
          version: fare.version,
          attributes: {
            df_version: fare.attributes?.df_version || 1,
            ticket_types: fare.attributes?.ticket_types || [],
            currency_type: fare.attributes?.currency_type || "INR",
            distance_unit: fare.attributes?.distance_unit || "m",
            extra: fare.attributes?.extra || {},
          },
          function: fare.function,
          scope: fare.scope,
          starts_at: fare.starts_at,
          expires_on: fare.expires_on,
          updated_on: fare.updated_on,
          created_on: fare.created_on,
        }));
        setFareList(formattedFares);
      })
      .catch((error) => {
        console.error("Error fetching fares:", error);
        showErrorToast(
          error.message || "Failed to fetch fare list. Please try again."
        );
      });
  };

  useEffect(() => {
    fetchGlobalFares();
  }, []);

  const handleSearchChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    field: keyof typeof search
  ) => {
    setSearch((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const filteredData = fareList.filter(
    (row) =>
      row.id.toString().toLowerCase().includes(search.id.toLowerCase()) &&
      row.name.toLowerCase().includes(search.name.toLowerCase())
  );

  const handleChangePage = (
    _event: React.MouseEvent<HTMLButtonElement> | null,
    newPage: number
  ) => {
    setPage(newPage);
  };

  return (
    <Box
      sx={{
        display: "flex",
        width: "100%",
        height: "100vh",
      }}
    >
      {/* Left Side - Table */}
      <Paper
        sx={{
          flex: "0 0 50%",
          maxWidth: "50%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          borderRight: "1px solid #e0e0e0",
        }}
      >
        <Box
          sx={{
            p: 2,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography variant="h6">Global Fares</Typography>
          <Button variant="contained">Add New Fare</Button>
        </Box>

        <TableContainer
          sx={{
            flex: 1,
            overflowY: "auto",
          }}
        >
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell
                  sx={{
                    width: "25%", 
                    maxWidth: "25%",
                    textAlign: "center",
                  }}
                >
                  <b style={{ display: "block", textAlign: "center" }}>ID</b>
                  <TextField
                    variant="outlined"
                    size="small"
                    placeholder="Search"
                    value={search.id}
                    onChange={(e) => handleSearchChange(e, "id")}
                    fullWidth
                    sx={{
                      "& .MuiInputBase-root": {
                        height: 40,
                        padding: "4px",
                        textAlign: "center",
                      },
                      "& .MuiInputBase-input": {
                        textAlign: "center",
                      },
                    }}
                  />
                </TableCell>
                <TableCell
                  sx={{
                    width: "75", 
                    textAlign: "center",
                  }}
                >
                  <b style={{ display: "block", textAlign: "center" }}>Name</b>
                  <TextField
                    variant="outlined"
                    size="small"
                    placeholder="Search"
                    value={search.name}
                    onChange={(e) => handleSearchChange(e, "name")}
                    fullWidth
                    sx={{
                      "& .MuiInputBase-root": {
                        height: 40,
                        padding: "4px",
                        textAlign: "center",
                      },
                      "& .MuiInputBase-input": {
                        textAlign: "center",
                      },
                    }}
                  />
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredData.length > 0 ? (
                filteredData
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((fare) => {
                    const isSelected = selectedFare?.id === fare.id;
                    return (
                      <TableRow
                        key={fare.id}
                        hover
                        selected={isSelected}
                        onClick={() => setSelectedFare(fare)}
                        sx={{
                          cursor: "pointer",
                          backgroundColor: isSelected
                            ? "#E3F2FD !important"
                            : "inherit",
                          "&:hover": {
                            backgroundColor: isSelected
                              ? "#E3F2FD !important"
                              : "#E3F2FD",
                          },
                        }}
                      >
                        <TableCell>{fare.id}</TableCell>
                        <TableCell>
                          {fare.name ? (
                            fare.name
                          ) : (
                            <Tooltip
                              title="Name not available"
                              placement="bottom"
                            >
                              <ErrorIcon sx={{ color: "#737d72 " }} />
                            </Tooltip>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })
              ) : (
                <TableRow>
                  <TableCell colSpan={3} align="center">
                    No fares found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pagination */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: 1,
            p: 1,
            borderTop: "1px solid #e0e0e0",
            backgroundColor: "white",
          }}
        >
          <Button
            onClick={() => handleChangePage(null, page - 1)}
            disabled={page === 0}
            sx={{ padding: "5px 10px", minWidth: 40 }}
          >
            &lt;
          </Button>
          {Array.from(
            { length: Math.ceil(filteredData.length / rowsPerPage) },
            (_, index) => index
          )
            .slice(
              Math.max(0, page - 1),
              Math.min(page + 2, Math.ceil(filteredData.length / rowsPerPage))
            )
            .map((pageNumber) => (
              <Button
                key={pageNumber}
                onClick={() => handleChangePage(null, pageNumber)}
                sx={{
                  padding: "5px 10px",
                  minWidth: 40,
                  bgcolor:
                    page === pageNumber
                      ? "rgba(21, 101, 192, 0.2)"
                      : "transparent",
                  fontWeight: page === pageNumber ? "bold" : "normal",
                  borderRadius: "5px",
                  transition: "all 0.3s",
                  "&:hover": {
                    bgcolor: "rgba(21, 101, 192, 0.3)",
                  },
                }}
              >
                {pageNumber + 1}
              </Button>
            ))}
          <Button
            onClick={() => handleChangePage(null, page + 1)}
            disabled={page >= Math.ceil(filteredData.length / rowsPerPage) - 1}
            sx={{ padding: "5px 10px", minWidth: 40 }}
          >
            &gt;
          </Button>
        </Box>
      </Paper>

      {/* Right Side - Editor */}
      <Paper
        sx={{
          flex: "0 0 50%",
          maxWidth: "50%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            p: 2,
            height: "10%",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderBottom: "1px solid #e0e0e0",
          }}
        >
          <Typography variant="h6">
            {selectedFare
              ? `Fare Function: ${selectedFare.name}`
              : "No Fare Selected"}
          </Typography>
          <Button
            variant="contained"
            disabled={false} // Always enabled
            sx={{ height: "40px" }}
            onClick={() => {
              try {
                // Wrap the eval call in a function to ensure it returns a value
                const output = (() =>
                  eval(selectedFare?.function || editableCode))();
                console.log("Output:", output);

                // Handle cases where the output is undefined
                if (output === undefined) {
                  setOutput(
                    "Output: undefined (Ensure your code has a return statement)"
                  );
                } else {
                  setOutput(`Output: ${output}`);
                }
              } catch (error) {
                console.error("Error executing code:", error);
                setOutput(
                  `Error: ${
                    error instanceof Error
                      ? error.message
                      : "An unknown error occurred"
                  }`
                );
              }
            }}
          >
            Run
          </Button>
        </Box>

        <Box sx={{ height: "80%", overflow: "hidden" }}>
          <CodeEditor
            value={selectedFare?.function || editableCode}
            readOnly={!!selectedFare}
            onChange={(value) => {
              if (!selectedFare) {
                setEditableCode(value || "");
              }
            }}
          />
        </Box>

        <Box
          sx={{
            height: "30%",
            p: 2,
            overflow: "auto",
            borderTop: "1px solid #e0e0e0",
          }}
        >
          <Typography variant="subtitle1" gutterBottom>
            Output:
          </Typography>
          <Paper
            sx={{
              p: 2,
              bgcolor: "#f5f5f5",
              height: "calc(100% - 40px)",
              overflow: "auto",
            }}
          >
            <pre>{output}</pre>
          </Paper>
        </Box>
      </Paper>
    </Box>
  );
};

export default FareListingPage;
