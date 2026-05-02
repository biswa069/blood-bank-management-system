import React, { useState } from "react";
import { useSelector } from "react-redux";
import API from "./../../../services/API";

const BulkImportModal = ({ onImportComplete }) => {
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [summary, setSummary] = useState(null);
    const [errorMsg, setErrorMsg] = useState("");

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
        setSummary(null);
        setErrorMsg("");
    };

    const handleBulkImportSubmit = async () => {
        if (!file) {
            return setErrorMsg("Please select a CSV file to upload.");
        }

        try {
            setLoading(true);
            setErrorMsg("");
            setSummary(null);

            const formData = new FormData();
            formData.append("file", file);

            const { data } = await API.post("/inventory/bulk-import", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            if (data?.success) {
                setSummary(data.summary);
                if (onImportComplete) onImportComplete();
            }
        } catch (error) {
            setErrorMsg(error.response?.data?.message || "Error processing bulk import.");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadTemplate = () => {
        const csvContent = "data:text/csv;charset=utf-8,email,bloodGroup\ndonor1@example.com,O+\ndonor2@example.com,AB-\n";
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "blood_camp_template.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div
            className="modal fade"
            id="bulkImportModal"
            data-bs-backdrop="static"
            data-bs-keyboard="false"
            tabIndex={-1}
            aria-labelledby="bulkImportModalLabel"
            aria-hidden="true"
        >
            <div className="modal-dialog modal-lg">
                <div className="modal-content">
                    <div className="modal-header bg-primary text-white">
                        <h1 className="modal-title fs-5" id="bulkImportModalLabel">
                            <i className="fa-solid fa-file-csv me-2"></i> Bulk Import (Blood Camp)
                        </h1>
                        <button
                            type="button"
                            className="btn-close btn-close-white"
                            data-bs-dismiss="modal"
                            aria-label="Close"
                            id="close-bulk-modal-btn"
                            onClick={() => {
                                setErrorMsg("");
                                setSummary(null);
                                setFile(null);
                            }}
                        />
                    </div>
                    <div className="modal-body">
                        {errorMsg && <div className="alert alert-danger py-2">{errorMsg}</div>}
                        
                        {!summary ? (
                            <>
                                <div className="mb-4">
                                    <p className="text-muted">
                                        Upload a CSV file to automatically log multiple 1-unit donations at once. This is ideal for bulk logging after a blood drive or blood camp.
                                    </p>
                                    <button 
                                        className="btn btn-outline-secondary btn-sm mb-3"
                                        onClick={handleDownloadTemplate}
                                    >
                                        <i className="fa-solid fa-download me-1"></i> Download CSV Template
                                    </button>
                                </div>

                                <div className="mb-3 p-4 border rounded bg-light text-center">
                                    <label htmlFor="csvUpload" className="form-label fw-bold d-block mb-3">
                                        Select CSV File
                                    </label>
                                    <input
                                        type="file"
                                        className="form-control"
                                        id="csvUpload"
                                        accept=".csv"
                                        onChange={handleFileChange}
                                    />
                                </div>
                            </>
                        ) : (
                            <div className="alert alert-success">
                                <h4 className="alert-heading"><i className="fa-solid fa-check-circle me-2"></i>Import Complete!</h4>
                                <hr />
                                <div className="row text-center mb-3">
                                    <div className="col">
                                        <h3 className="text-primary">{summary.totalProcessed}</h3>
                                        <span className="text-muted small">Total Rows</span>
                                    </div>
                                    <div className="col">
                                        <h3 className="text-success">{summary.successCount}</h3>
                                        <span className="text-muted small">Successful Imports</span>
                                    </div>
                                    <div className="col">
                                        <h3 className="text-danger">{summary.errors?.length || 0}</h3>
                                        <span className="text-muted small">Failed Imports</span>
                                    </div>
                                </div>
                                
                                {summary.errors && summary.errors.length > 0 && (
                                    <div className="mt-3">
                                        <p className="mb-2 fw-bold text-danger">Error Log:</p>
                                        <div className="bg-white p-2 border rounded" style={{maxHeight: '150px', overflowY: 'auto'}}>
                                            <ul className="list-unstyled mb-0 small text-danger">
                                                {summary.errors.map((err, idx) => (
                                                    <li key={idx}><i className="fa-solid fa-triangle-exclamation me-1"></i> {err}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                    <div className="modal-footer">
                        <button
                            type="button"
                            className="btn btn-secondary"
                            data-bs-dismiss="modal"
                            onClick={() => {
                                setErrorMsg("");
                                setSummary(null);
                                setFile(null);
                            }}
                        >
                            {summary ? "Close" : "Cancel"}
                        </button>
                        {!summary && (
                            <button
                                type="button"
                                className="btn btn-primary"
                                onClick={handleBulkImportSubmit}
                                disabled={loading || !file}
                            >
                                {loading ? "Processing..." : "Start Import"}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BulkImportModal;
