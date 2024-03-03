import "./App.css";
import { Input, Stack } from "@chakra-ui/react";
import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  CardFooter,
  CardHeader,
  Heading,
  Card,
  Button,
  CardBody,
} from "@chakra-ui/react";
import { useState } from "react";
import * as XLSX from "xlsx";
import { format, isDate, isValid } from "date-fns";

function App() {
  const [data, setData] = useState([]);
  const [isEditing, setIsEditing] = useState(false);

  const formatDate = (dateValue) => {
    let date;

    if (typeof dateValue === 'string' && !isNaN(Number(dateValue))) {
      date = new Date(Number(dateValue));
    } else {
      date = new Date(dateValue);
    }

    if (isValid(date)) {
      return format(date, 'dd/MM/yyyy', { awareOfUnicodeTokens: true });
    } else {
      return String(dateValue);
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
        transformProductInRow(row);
        return row;
      });
      console.log(worksheet);
      console.log("Formatted Data:", formattedData);
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
    XLSX.writeFile(editedWorkbook, "documento_atulizado.xlsx");
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
    <body>
      <div className="inputWrapper">
        <Card
          boxShadow="xl"
          color={"white"}
          backgroundColor="black"
          className="card"
          align="center"
        >
          <CardHeader>
            <Heading  color={"#F1CD5A"} size="lg">Upload</Heading>
          </CardHeader>
          <CardBody className="cardBody">
            <Stack>
              <Input
                type="file"
                placeholder="Insira o arquivo"
                borderColor="teal.500"
                borderRadius="md"
                borderWidth="2px"
                _hover={{ borderColor: "teal.700" }}
                _focus={{ borderColor: "teal.900" }}
                className="fileInput"
                onChange={handleFileChange}
                pt={1}
              ></Input>
            </Stack>

            <div className="buttonsWrapper">
              <Button
                className="editButton"
                backgroundColor= {"#F1CD5A"}

                variant="solid"
                onClick={handleEditTable}
                disabled={isEditing}
              >
                Editar Tabela
              </Button>
              <br />
              {data && (
                <Button
                  backgroundColor= {"#F1CD5A"}
                  className="downloadButton"
                  variant="solid"
                  onClick={downloadEditedData}
                  disabled={isEditing}
                >
                  Baixar Tabela
                </Button>
              )}
              {isEditing && (
                <Button
                  className="saveButton"
                  backgroundColor= {"#F1CD5A"}

                  variant="solid"
                  onClick={saveChanges}
                >
                  Salvar Edição
                </Button>
              )}
            </div>
          </CardBody>
          <CardFooter>
          </CardFooter>
          <Card
          boxShadow="xl"
          backgroundColor="#c3c3c3"
          className="card"
          align="center"
        >
          <CardHeader>
            <Heading size="lg">Vendas</Heading>
          </CardHeader>
          <CardBody className="cardBody">
          <div>
                <Table variant="simple">
                  <Thead>
                    <Tr>
                      <Th>Total de Vendas por Mês</Th>
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

                <Table variant="simple">
                  <Thead>
                    <Tr>
                      <Th>Total de Vendas por Categoria</Th>
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
          </CardBody>         
        </Card>
        </Card>
      </div>
      <div className="tableWrapper">
        <TableContainer
        ml={2}
        mt={1}
        pl={2}
        borderWidth="2px"
        borderRadius="md"
        borderColor="#F1CD5A"      
        className="TableContainer">
          <Table size="lg" >
            <Thead>
              <Tr>
                {data.length > 0 &&
                  Object.keys(data[0]).map((header, headerIndex) => (
                    <Th
                      color={"white"}
                      key={headerIndex}
                      borderBottom="2px"
                      borderColor="#F1CD5A"
                      fontSize="lg"
                    >
                      {header}
                    </Th>
                  ))}
              </Tr>
            </Thead>
            <Tbody>
              {data.map((row, rowIndex) => (
                <Tr key={rowIndex}>
                  {Object.keys(row).map((key, cellIndex) => (
                    <Td borderColor="#F1CD5A" key={cellIndex} fontSize="md">
                      {isEditing ? (
                        <input
                          type="text"
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
        </TableContainer>
      </div>
    </body>
  );
}
export default App;
