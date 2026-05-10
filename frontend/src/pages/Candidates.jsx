import { useEffect, useRef, useState } from "react";
import { getAllCandidates } from "../api/candidate.api";
import Chart from "chart.js/auto";

const Candidates = () => {
    const [candidates, setCandidates] = useState([]);
    const [error, setError] = useState("");
    const doughnutCanvasRef = useRef(null);
    const barChartCanvasRef = useRef(null);
    const doughnutChartRef = useRef(null);
    const barChartInstanceRef = useRef(null);

    const getPaletteColor = (index) => {
        const colors = ["#0d9488", "#2563eb", "#f97316", "#a855f7", "#22c55e", "#e11d48", "#1d4ed8"];
        return colors[index % colors.length];
    };

    const updateCharts = (list) => {
        if (!Array.isArray(list)) return;

        // Bar chart: vote share % per candidate
        if (barChartInstanceRef.current && barChartCanvasRef.current) {
            const totalVotes = list.reduce((s, c) => s + (c.voteCount ?? 0), 0);
            const labels = list.map((c) => c.name);
            const data = list.map((c) => {
                const count = c.voteCount ?? 0;
                return totalVotes > 0 ? Number(((count / totalVotes) * 100).toFixed(1)) : 0;
            });
            const backgroundColors = labels.map((_, idx) => {
                const base = getPaletteColor(idx);
                return base.endsWith(")") ? base : base + "33";
            });

            barChartInstanceRef.current.data.labels = labels;
            barChartInstanceRef.current.data.datasets = [
                {
                    label: "Vote share %",
                    data,
                    backgroundColor: backgroundColors,
                    borderColor: list.map((_, idx) => getPaletteColor(idx)),
                    borderWidth: 1,
                },
            ];
            barChartInstanceRef.current.update();
        }

        // Party share doughnut
        if (doughnutChartRef.current) {
            const partyTotals = {};
            list.forEach((c) => {
                const party = c.party || "Unknown";
                partyTotals[party] = (partyTotals[party] || 0) + (c.voteCount ?? 0);
            });
            const parties = Object.keys(partyTotals);
            doughnutChartRef.current.data.labels = parties;
            doughnutChartRef.current.data.datasets = [
                {
                    label: "Votes by party",
                    data: parties.map((p) => partyTotals[p]),
                    backgroundColor: parties.map((_, idx) => getPaletteColor(idx) + "66"),
                    borderColor: parties.map((_, idx) => getPaletteColor(idx)),
                    borderWidth: 1,
                },
            ];
            doughnutChartRef.current.update();
        }
    };

    useEffect(() => {
        const fetchCandidates = async () => {
            try {
                const data = await getAllCandidates();
                const list = Array.isArray(data) ? data : [];
                setCandidates(list);
                updateCharts(list);
            } catch (err) {
                setError("Failed to load candidates.");
            }
        };
        fetchCandidates();
        const intervalId = setInterval(fetchCandidates, 5000);
        return () => clearInterval(intervalId);
    }, []);

    useEffect(() => {
        if (barChartCanvasRef.current && !barChartInstanceRef.current) {
            barChartInstanceRef.current = new Chart(barChartCanvasRef.current, {
                type: "bar",
                data: { labels: [], datasets: [] },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { position: "bottom" } },
                    scales: {
                        x: {
                            title: {
                                display: true,
                                text: "Candidates",
                            },
                        },
                        y: {
                            beginAtZero: true,
                            max: 100,
                            title: {
                                display: true,
                                text: "Vote share %",
                            },
                        },
                    },
                },
            });
        }
        if (doughnutCanvasRef.current && !doughnutChartRef.current) {
            doughnutChartRef.current = new Chart(doughnutCanvasRef.current, {
                type: "doughnut",
                data: { labels: [], datasets: [] },
                options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: "bottom" } } },
            });
        }
        return () => {
            if (barChartInstanceRef.current) {
                barChartInstanceRef.current.destroy();
                barChartInstanceRef.current = null;
            }
            if (doughnutChartRef.current) {
                doughnutChartRef.current.destroy();
                doughnutChartRef.current = null;
            }
        };
    }, []);

    return (
        <div className="page candidates-page">
            <h2 className="page__title">Candidates</h2>

            <section className="card" style={{ marginBottom: 16 }}>
                <h3 className="section-title">Live voting dashboard</h3>
                <p className="muted-text" style={{ marginTop: 6 }}>
                    Party distribution and vote share % per candidate.
                </p>
                <div className="admin-charts">
                    <div className="admin-chart">
                        <h4 className="section-title">Party vote share</h4>
                        <div className="admin-chart__canvas">
                            <canvas ref={doughnutCanvasRef} aria-label="Party vote share" />
                        </div>
                    </div>
                    <div className="admin-chart">
                        <h4 className="section-title">Vote share % per candidate</h4>
                        <div className="admin-chart__canvas">
                            <canvas ref={barChartCanvasRef} aria-label="Vote share per candidate" />
                        </div>
                    </div>
                </div>
            </section>

            {error && <p className="alert alert--error">{error}</p>}

            {candidates.length === 0 && !error && (
                <p className="muted-text">No candidates available.</p>
            )}

            <div className="candidates-grid">
                {candidates.map((candidate) => (
                    <div key={candidate._id} className="candidate-card">
                        <div className="candidate-card__header">
                            {candidate.candidateImage ? (
                                <img
                                    src={candidate.candidateImage}
                                    alt={candidate.name}
                                    className="candidate-card__avatar"
                                />
                            ) : (
                                <div className="candidate-card__avatar candidate-card__avatar--placeholder">
                                    {candidate.name?.charAt(0)?.toUpperCase() || "?"}
                                </div>
                            )}
                            <div>
                                <h3 className="candidate-card__name">{candidate.name}</h3>
                                <div className="candidate-card__party">
                                    {candidate.partyImage && (
                                        <img
                                            src={candidate.partyImage}
                                            alt=""
                                            className="candidate-card__party-logo"
                                        />
                                    )}
                                    <span>{candidate.party}</span>
                                </div>
                            </div>
                        </div>
                        <div className="candidate-card__fullinfo">
                            {candidate.address && <p><strong>Address:</strong> {candidate.address}</p>}
                            {candidate.age != null && <p><strong>Age:</strong> {candidate.age}</p>}
                            {candidate.mobile && <p><strong>Mobile:</strong> {candidate.mobile}</p>}
                            <p>
                                <strong>Vote share:</strong>{" "}
                                {(() => {
                                    const total = candidates.reduce((s, c) => s + (c.voteCount ?? 0), 0);
                                    const count = candidate.voteCount ?? 0;
                                    const pct = total > 0 ? ((count / total) * 100).toFixed(1) : "0";
                                    return `${pct}%`;
                                })()}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Candidates;
