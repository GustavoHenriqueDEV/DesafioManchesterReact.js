import { useState } from "react";
import * as XLSX from "xlsx";
import { format } from "date-fns";
import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  CardHeader,
  Heading,
  Card,
  Button,
  CardBody,
  Link,
  Input,
} from "@chakra-ui/react";

function App() {
  const [data, setData] = useState([]);
  const [isEditing, setIsEditing] = useState(false);


  const formatDate = (dateValue) => {
    if (!dateValue) {
      return ''; 
    }
  
    let date;
  
    if (typeof dateValue === 'number' && !isNaN(dateValue) && dateValue >= 1) {
      date = new Date(1899, 11, dateValue); 
    } else {
      date = new Date(dateValue);
    }
  
    if (!isNaN(date.getTime())) {
      return format(date, 'dd/MM/yyyy', { awareOfUnicodeTokens: true });
    } else {
      return dateValue.toString(); 
    }
  };
  
      const handleFileChange = (event) => {
    const file = event.target.files[0];

    if (file) readExcel(file);
  };

  const mapProducts = {
    A: "Celulares",
    B: "Computadores",
    C: "Mouses",
    D: "Teclados",
    E: "Monitores",
  };

  const transformProductInRow = (row) => {
    if (row["PRODUTO"]) {
      const mappedCategory = mapProducts[row["PRODUTO"]];
      if (mappedCategory) {
        row["PRODUTO"] = mappedCategory;
      }
    }
    return row;
  };

  const mapCliente = {
    1: "TechSolutions",
    2: "Global Innovations S/A.",
    3: "Future Enterprises Inc.",
    4: "Quantum Dynamics Corp.",
    5: "Frontier Technologies Ltd.",
    6: "Prime Solutions Group.",
    7: "Apex Ventures International",
    8: "nnovateX Holdings LLC",
    };
  const transformClientInRow = (row) => {
    if (row["CLIENTE"]) {
      const mappedClient = mapCliente[row["CLIENTE"]];
      if (mappedClient) {
        row["CLIENTE"] = mappedClient;
      }
    }
    return row;
  };

  
  const readExcel = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const workbook = XLSX.read(e.target.result, { type: "binary" });
      const worksheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[worksheetName];
      const formattedData = XLSX.utils.sheet_to_json(worksheet).map((row) => {
        if (row["DATA"]) {
          row["DATA"] = formatDate(row["DATA"]);
        }
        transformClientInRow(row);
        transformProductInRow(row);
        return row;
      });
      setData(formattedData);
    };
    reader.readAsBinaryString(file);
  };

  const handleEditTable = () => {
    setIsEditing(true);
  };

  const saveChanges = () => {
    setIsEditing(false);
  };

  const downloadEditedData = () => {
    const editedWorkbook = XLSX.utils.book_new();
    const editedWorksheet = XLSX.utils.json_to_sheet(data);
    XLSX.utils.book_append_sheet(editedWorkbook, editedWorksheet, "Sheet 1");
    XLSX.writeFile(editedWorkbook, "documento_atualizado.xlsx");
  };

  const calculateTotals = () => {
    const monthlyTotals = {};
    const categoryTotals = {};

    data.forEach((sale) => {
      const month = sale["DATA"].substring(3, 10);
      const category = sale["PRODUTO"];
      const amount = parseFloat(sale["QUANTIDADE_VENDIDA"]);

      monthlyTotals[month] = (monthlyTotals[month] || 0) + amount;
      categoryTotals[category] = (categoryTotals[category] || 0) + amount;
    });
    return { monthlyTotals, categoryTotals };
  };

  const { monthlyTotals, categoryTotals } = calculateTotals();

  return (
    <>
      <header style={{ backgroundColor: "#161616", color: "#F1CD5A", padding: "20px", marginBottom: "20px" }}>
        <Heading size="lg" textAlign="center">
          Sistema de Vendas
        </Heading>
      </header>
      <body>
        <div style={{ marginLeft: "20px", marginRight: "20px" }}>
          <Card boxShadow="xl" backgroundColor="#161616" color="#F1CD5A" align="center" marginBottom="20px">
            <CardHeader>
              <Heading size="lg">Upload</Heading>
            </CardHeader>
            <CardBody>
              <input
                type="file"
                onChange={handleFileChange}
                style={{ marginBottom: "10px" }}
              />
              <div>
                <Button
                  backgroundColor="#F1CD5A"
                  color="#161616"
                  onClick={handleEditTable}
                  disabled={isEditing}
                  marginRight="10px"
                >
                  Editar Tabela
                </Button>
                {data.length > 0 && (
                  <Button
                    backgroundColor="#F1CD5A"
                    color="#161616"
                    onClick={downloadEditedData}
                    disabled={isEditing}
                    marginRight="10px"
                  >
                    Baixar Tabela
                  </Button>
                )}
                {isEditing && (
                  <Button
                    backgroundColor="#F1CD5A"
                    color="#161616"
                    onClick={saveChanges}
                  >
                    Salvar Edição
                  </Button>
                )}
              </div>
            </CardBody>
          </Card>

          <Card boxShadow="xl" backgroundColor="#1A1A1A" color="white" align="center">
            <CardHeader>
              <Heading size="lg">Vendas</Heading>
            </CardHeader>
            <CardBody>
              <div style={{ overflowX: "auto" }}>
                <Table variant="simple" colorScheme="whiteAlpha">
                  <Thead>
                    <Tr>
                      {Object.keys(data[0] || {}).map((header) => (
                        <Th key={header}>{header}</Th>
                      ))}
                    </Tr>
                  </Thead>
                  <Tbody>
                    {data.map((row, rowIndex) => (
                      <Tr key={rowIndex}>
                        {Object.keys(row).map((key, cellIndex) => (
                          <Td key={cellIndex}>
                            {isEditing ? (
                              <Input
                                value={row[key]}
                                onChange={(e) => {
                                  const newData = [...data];
                                  newData[rowIndex][key] = e.target.value;
                                  setData(newData);
                                }}
                              />
                            ) : (
                              row[key]
                            )}
                          </Td>
                        ))}
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </div>
            </CardBody>
          </Card>
        </div>
        <div className="SaledTable">
                <Table borderRadius={10} ml={1} className="SaledTable" backgroundColor={"grey"} variant="simple">
                  <Thead>
                    <Tr>
                      <Th  color={"white"} alignContent={"center"} justifyContent={"center"} display={"flex"} >Total de Vendas por Mês</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {Object.entries(monthlyTotals).map(([month, total]) => (
                      <Tr key={month}>
                        <Td>{`Mês ${month}`}</Td>
                        <Td isNumeric>{`R$ ${total.toFixed(2)}`}</Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
                <Table borderRadius={10} ml={1} className="SaledTable" backgroundColor={"grey"} variant="simple">
                  <Thead>
                    <Tr>
                      <Th  color={"white"} alignContent={"center"} justifyContent={"center"} display={"flex"} >Total de Vendas por Categoria</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {Object.entries(categoryTotals).map(([category, total]) => (
                      <Tr key={category}>
                        <Td>{category}</Td>
                        <Td isNumeric>{`R$ ${total.toFixed(2)}`}</Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
        </div>
      </body>
      <footer style={{ backgroundColor: "#161616", color: "#F1CD5A", padding: "20px", marginTop: "20px" }}>
        <Link href="https://github.com/GustavoHenriqueDEV" isExternal>
          Meu GitHub
        </Link>
      </footer>
    </>
  );
}

export default App;