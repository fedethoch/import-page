"use client"

import type React from "react"
import { useState } from "react"
import axios from "axios"
import "./App.css"

type Formulario = {
  producto: string
  cantidad: string
  producto_inicial: string
  producto_final: string
  die: string
  comision_ml: string
  envio: string
}

type ResultadoDetallado = {
  producto: string
  cantidad: number
  viabilidad: boolean
  precios: {
    compra: number
    venta: number
    ganancia_bruta_unitaria: number
    ganancia_neta_unitaria: number
  }
  costos: {
    producto_total: number
    impuestos_total: number
    envio_total: number
    costos_fijos: number
    costo_total: number
  }
  impuestos: {
    die: number
    iva: number
    te: number
    total: number
  }
  resultados: {
    venta_bruta: number
    ganancia_total: number
    porcentaje_ganancia: number
    comision_ml: number
  }
  nombre_archivo: string
}

const inicial: Formulario = {
  producto: "",
  cantidad: "",
  producto_inicial: "",
  producto_final: "",
  die: "",
  comision_ml: "",
  envio: "",
}

function App() {
  const [form, setForm] = useState<Formulario>(inicial)
  const [resultado, setResultado] = useState<ResultadoDetallado | null>(null)
  const [loading, setLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const datos = { ...form }

    try {
      const res = await axios.post("https://app-py-gfb2.onrender.com/api/calcular", datos)
      setResultado(res.data)
    } catch (err) {
      alert("Error al conectar con el backend.")
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      minimumFractionDigits: 2,
    }).format(amount)
  }

  return (
    <div className="app-container">
      {/* Header */}
      <header className="app-header">
        <div className="header-content">
          <div className="header-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="4" y="4" width="16" height="16" rx="2" />
              <rect x="9" y="9" width="1" height="1" />
              <rect x="14" y="9" width="1" height="1" />
              <rect x="9" y="14" width="1" height="1" />
              <rect x="14" y="14" width="1" height="1" />
            </svg>
          </div>
          <div className="header-text">
            <h1>Calculadora de Rentabilidad</h1>
            <p>Analiza la viabilidad de tus importaciones</p>
          </div>
        </div>
      </header>

      <div className="main-content">
        <div className="content-grid">
          {/* Formulario */}
          <div className="form-card">
            <div className="card-header">
              <h2>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                  <polyline points="3.27,6.96 12,12.01 20.73,6.96" />
                  <line x1="12" y1="22.08" x2="12" y2="12" />
                </svg>
                Datos del Producto
              </h2>
              <p>Ingresa la información de tu producto para calcular la rentabilidad</p>
            </div>

            <form onSubmit={handleSubmit} className="form-content">
              <div className="form-group">
                <label htmlFor="producto">Nombre del producto</label>
                <input
                  type="text"
                  id="producto"
                  name="producto"
                  required
                  value={form.producto}
                  onChange={handleChange}
                  placeholder="Ej: iPhone 15 Pro"
                  className="form-input"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="cantidad">Cantidad</label>
                  <input
                    type="number"
                    id="cantidad"
                    name="cantidad"
                    required
                    value={form.cantidad}
                    onChange={handleChange}
                    placeholder="100"
                    className="form-input"
                    step="any"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="die">DIE (%)</label>
                  <input
                    type="number"
                    id="die"
                    name="die"
                    required
                    value={form.die}
                    onChange={handleChange}
                    placeholder="21"
                    className="form-input"
                    step="any"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="producto_inicial">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="12" y1="1" x2="12" y2="23" />
                      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                    </svg>
                    Precio de compra
                  </label>
                  <input
                    type="number"
                    id="producto_inicial"
                    name="producto_inicial"
                    required
                    value={form.producto_inicial}
                    onChange={handleChange}
                    placeholder="500"
                    className="form-input price-input"
                    step="any"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="producto_final">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="22,12 18,12 15,21 9,3 6,12 2,12" />
                    </svg>
                    Precio de venta
                  </label>
                  <input
                    type="number"
                    id="producto_final"
                    name="producto_final"
                    required
                    value={form.producto_final}
                    onChange={handleChange}
                    placeholder="800"
                    className="form-input price-input"
                    step="any"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="comision_ml">Comisión Mercado Libre (%)</label>
                <input
                  type="number"
                  id="comision_ml"
                  name="comision_ml"
                  required
                  value={form.comision_ml}
                  onChange={handleChange}
                  placeholder="13.5"
                  className="form-input"
                  step="any"
                />
              </div>

              <div className="form-group">
                <label htmlFor="envio">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="1" y="3" width="15" height="13" />
                    <polygon points="16,8 20,8 23,11 23,16 16,16" />
                    <circle cx="5.5" cy="18.5" r="2.5" />
                    <circle cx="18.5" cy="18.5" r="2.5" />
                  </svg>
                  Costo del envío por unidad
                </label>
                <input
                  type="number"
                  id="envio"
                  name="envio"
                  required
                  value={form.envio}
                  onChange={handleChange}
                  placeholder="Ej: 50"
                  className="form-input"
                  step="any"
                />
              </div>

              <button type="submit" disabled={loading} className="submit-button">
                {loading ? (
                  <>
                    <div className="spinner"></div>
                    Calculando...
                  </>
                ) : (
                  <>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="4" y="4" width="16" height="16" rx="2" />
                      <rect x="9" y="9" width="1" height="1" />
                      <rect x="14" y="9" width="1" height="1" />
                      <rect x="9" y="14" width="1" height="1" />
                      <rect x="14" y="14" width="1" height="1" />
                    </svg>
                    Calcular Rentabilidad
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Resultado Mejorado */}
          {resultado && (
            <div className="result-card">
              <div className="card-header">
                <h2 className={resultado.viabilidad ? "viable" : "no-viable"}>
                  {resultado.viabilidad ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                      <polyline points="22,4 12,14.01 9,11.01" />
                    </svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="15" y1="9" x2="9" y2="15" />
                      <line x1="9" y1="9" x2="15" y2="15" />
                    </svg>
                  )}
                  {resultado.viabilidad ? "¡Producto Viable!" : "Producto No Viable"}
                </h2>
                <p>Análisis completo para {resultado.producto}</p>
              </div>

              <div className="result-content">
                {/* Resumen principal */}
                <div className={`summary-card ${resultado.viabilidad ? "viable" : "no-viable"}`}>
                  <div className="summary-item">
                    <span className="summary-label">Ganancia Total</span>
                    <span className="summary-value">{formatCurrency(resultado.resultados.ganancia_total)}</span>
                  </div>
                  <div className="summary-item">
                    <span className="summary-label">Margen</span>
                    <span className="summary-value">{resultado.resultados.porcentaje_ganancia.toFixed(1)}%</span>
                  </div>
                </div>

                {/* Desglose de precios */}
                <div className="detail-section">
                  <h3>💰 Análisis de Precios</h3>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <span className="detail-label">Precio de compra</span>
                      <span className="detail-value">{formatCurrency(resultado.precios.compra)}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Precio de venta</span>
                      <span className="detail-value">{formatCurrency(resultado.precios.venta)}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Ganancia unitaria neta</span>
                      <span className="detail-value">{formatCurrency(resultado.precios.ganancia_neta_unitaria)}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Cantidad</span>
                      <span className="detail-value">{resultado.cantidad} unidades</span>
                    </div>
                  </div>
                </div>

                {/* Desglose de costos */}
                <div className="detail-section">
                  <h3>📊 Desglose de Costos</h3>
                  <div className="cost-breakdown">
                    <div className="cost-item">
                      <div className="cost-bar">
                        <div
                          className="cost-fill product-cost"
                          style={{
                            width: `${(resultado.costos.producto_total / resultado.costos.costo_total) * 100}%`,
                          }}
                        ></div>
                      </div>
                      <div className="cost-details">
                        <span className="cost-label">Costo del producto</span>
                        <span className="cost-value">{formatCurrency(resultado.costos.producto_total)}</span>
                      </div>
                    </div>

                    <div className="cost-item">
                      <div className="cost-bar">
                        <div
                          className="cost-fill tax-cost"
                          style={{
                            width: `${(resultado.costos.impuestos_total / resultado.costos.costo_total) * 100}%`,
                          }}
                        ></div>
                      </div>
                      <div className="cost-details">
                        <span className="cost-label">Impuestos ({resultado.impuestos.total}%)</span>
                        <span className="cost-value">{formatCurrency(resultado.costos.impuestos_total)}</span>
                      </div>
                    </div>

                    <div className="cost-item">
                      <div className="cost-bar">
                        <div
                          className="cost-fill shipping-cost"
                          style={{ width: `${(resultado.costos.envio_total / resultado.costos.costo_total) * 100}%` }}
                        ></div>
                      </div>
                      <div className="cost-details">
                        <span className="cost-label">Envío</span>
                        <span className="cost-value">{formatCurrency(resultado.costos.envio_total)}</span>
                      </div>
                    </div>

                    <div className="cost-item">
                      <div className="cost-bar">
                        <div
                          className="cost-fill fixed-cost"
                          style={{ width: `${(resultado.costos.costos_fijos / resultado.costos.costo_total) * 100}%` }}
                        ></div>
                      </div>
                      <div className="cost-details">
                        <span className="cost-label">Costos fijos</span>
                        <span className="cost-value">{formatCurrency(resultado.costos.costos_fijos)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="total-cost">
                    <span className="total-label">Costo Total:</span>
                    <span className="total-value">{formatCurrency(resultado.costos.costo_total)}</span>
                  </div>
                </div>

                {/* Botón de descarga */}
                <a
                  href={`http://localhost:5000/api/descargar/${resultado.nombre_archivo}`}
                  download
                  className="download-button"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7,10 12,15 17,10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                  Descargar Informe PDF Completo
                </a>
              </div>
            </div>
          )}

          {/* Información adicional */}
          {!resultado && (
            <div className="info-card">
              <div className="card-header">
                <h2>¿Cómo funciona?</h2>
              </div>
              <div className="info-content">
                <div className="info-step">
                  <div className="step-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                    </svg>
                  </div>
                  <div>
                    <h4>1. Datos del Producto</h4>
                    <p>Ingresa información básica como nombre, cantidad y precios</p>
                  </div>
                </div>

                <div className="info-step">
                  <div className="step-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="4" y="4" width="16" height="16" rx="2" />
                    </svg>
                  </div>
                  <div>
                    <h4>2. Cálculo Automático</h4>
                    <p>Calculamos costos, impuestos y comisiones automáticamente</p>
                  </div>
                </div>

                <div className="info-step">
                  <div className="step-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="22,12 18,12 15,21 9,3 6,12 2,12" />
                    </svg>
                  </div>
                  <div>
                    <h4>3. Análisis de Rentabilidad</h4>
                    <p>Obtén un informe detallado con márgenes y recomendaciones</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default App
