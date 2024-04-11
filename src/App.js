import React, { useState } from 'react';
import { Button, Modal, message } from 'antd';
import * as XLSX from 'xlsx';
import './App.css'; // Importe o arquivo de estilo

function App() {
    const [showChoiceModal, setShowChoiceModal] = useState(false);
    const [showConfirmationModal, setShowConfirmationModal] = useState(false);
    const [tempData, setTempData] = useState([]);
    const [fileName, setFileName] = useState('');

    const openChoiceModal = () => {
        setShowChoiceModal(true);
    };

    const closeChoiceModal = () => {
        setShowChoiceModal(false);
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setFileName(file.name);
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const workbook = XLSX.read(event.target.result, { type: 'binary' });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                const excelData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

                if (!excelData || excelData.length === 0) {
                    message.error('O arquivo XLSX está vazio.');
                    return;
                }

                const headerRow = excelData[0];
                if (
                    !headerRow ||
                    headerRow.length < 4 ||
                    headerRow[0] !== 'RA' ||
                    headerRow[1] !== 'DTINICIO' ||
                    headerRow[2] !== 'DTFINAL' ||
                    headerRow[3] !== 'OBS'
                ) {
                    message.error('O arquivo XLSX não possui as colunas necessárias (RA, DTINICIO, DTFINAL, OBS).');
                    return;
                }

                setTempData(excelData.slice(1));
                closeChoiceModal();
                setShowConfirmationModal(true);
            } catch (error) {
                message.error('Ocorreu um erro ao importar o arquivo.');
            }
        };

        reader.readAsBinaryString(file);
    };

    const handleConfirmImport = () => {
        setTempData([]);
        setShowConfirmationModal(false);
        message.success(`Arquivo "${fileName}" importado com sucesso!`);
    };

    const handleCancelImport = () => {
        setTempData([]);
        setShowConfirmationModal(false);
        message.info('Importação cancelada.');
    };

    const downloadTemplate = () => {
        const exampleData = [
            ['RA', 'DTINICIO', 'DTFINAL', 'OBS'],
            ['2310127', '15-04-2024', '30-04-2024', 'Exemplo de OBS 1'],
        ];

        const worksheet = XLSX.utils.aoa_to_sheet(exampleData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Modelo');
        XLSX.writeFile(workbook, 'modelo.xlsx');
        message.success('Modelo de arquivo XLSX baixado com sucesso!');
    };

    return (
        <div>
            <Button type="primary" onClick={openChoiceModal}>
                Importar Excel
            </Button>

            <Modal
                title="Escolha uma opção"
                visible={showChoiceModal}
                onCancel={closeChoiceModal}
                footer={null}
            >
                <div className="modal-button-container">
                    <input type="file" accept=".xlsx" onChange={handleFileUpload} />
                    <Button type="default" onClick={downloadTemplate} style={{ marginLeft: '10px' }}>
                        Baixar modelo de arquivo
                    </Button>
                </div>
            </Modal>

            <Modal
                title="Confirmação de importação"
                visible={showConfirmationModal}
                onOk={handleConfirmImport}
                onCancel={handleCancelImport}
                okText="Confirmar"
                cancelText="Cancelar"
            >
                <p>Deseja importar o arquivo "{fileName}"?</p>
            </Modal>
        </div>
    );
}

export default App;
