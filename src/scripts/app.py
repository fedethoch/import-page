from flask import Flask, request, jsonify, send_file
import os
from flask_cors import CORS
from reportlab.lib.pagesizes import letter, A4
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT
from reportlab.platypus import PageBreak
from datetime import datetime
import io

app = Flask(__name__)
CORS(app)

def calcular_viabilidad(datos):
    producto = datos['producto']
    cantidad = float(datos['cantidad'])
    producto_inicial = float(datos['producto_inicial'])
    producto_final = float(datos['producto_final'])
    die = float(datos['die']) / 100
    iva = 21/100
    te = 0.005
    comision_ml = float(datos['comision_ml']) / 100
    
    # Siempre usar el valor de envío ingresado por el usuario
    envio = float(datos['envio']) * cantidad
    
    costo_fijo = 10 + 28
    impuestos = die + iva + te
    costo = (cantidad * producto_inicial) + (cantidad * producto_inicial * die) + (cantidad * producto_inicial * iva) + (cantidad * producto_inicial * te) + costo_fijo + envio
    venta = cantidad * producto_final - (cantidad * producto_final * comision_ml)
    viabilidad_si = venta - costo > 0
    ganancia_producto_final = producto_final - producto_final * 0.02
    ganancia_total = venta - costo
    porcentaje_ganancia = (venta / costo * 100) if costo != 0 else 0
    
    # Datos estructurados para el frontend
    resultado_detallado = {
        "producto": producto,
        "cantidad": int(cantidad),
        "viabilidad": viabilidad_si,
        "precios": {
            "compra": round(producto_inicial, 2),
            "venta": round(producto_final, 2),
            "ganancia_bruta_unitaria": round(ganancia_producto_final, 2),
            "ganancia_neta_unitaria": round(ganancia_total / cantidad, 2)
        },
        "costos": {
            "producto_total": round(cantidad * producto_inicial, 2),
            "impuestos_total": round(cantidad * producto_inicial * impuestos, 2),
            "envio_total": round(envio, 2),
            "costos_fijos": round(costo_fijo, 2),
            "costo_total": round(costo, 2)
        },
        "impuestos": {
            "die": round(die * 100, 2),
            "iva": round(iva * 100, 2),
            "te": round(te * 100, 2),
            "total": round(impuestos * 100, 2)
        },
        "resultados": {
            "venta_bruta": round(venta, 2),
            "ganancia_total": round(ganancia_total, 2),
            "porcentaje_ganancia": round(porcentaje_ganancia, 2),
            "comision_ml": round(comision_ml * 100, 2)
        }
    }
    
    return resultado_detallado

def generar_pdf(datos_resultado):
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4, rightMargin=72, leftMargin=72, topMargin=72, bottomMargin=18)
    
    # Estilos
    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=24,
        spaceAfter=30,
        alignment=TA_CENTER,
        textColor=colors.HexColor('#2563eb')
    )
    
    subtitle_style = ParagraphStyle(
        'CustomSubtitle',
        parent=styles['Heading2'],
        fontSize=16,
        spaceAfter=20,
        textColor=colors.HexColor('#1f2937')
    )
    
    normal_style = ParagraphStyle(
        'CustomNormal',
        parent=styles['Normal'],
        fontSize=11,
        spaceAfter=12
    )
    
    # Contenido del PDF
    story = []
    
    # Título
    story.append(Paragraph("📊 Informe de Viabilidad de Importación", title_style))
    story.append(Spacer(1, 20))
    
    # Información del producto
    story.append(Paragraph("📦 Información del Producto", subtitle_style))
    
    producto_data = [
        ['Producto:', datos_resultado['producto']],
        ['Cantidad:', f"{datos_resultado['cantidad']} unidades"],
        ['Fecha del análisis:', datetime.now().strftime("%d/%m/%Y %H:%M")],
        ['Estado:', '✅ VIABLE' if datos_resultado['viabilidad'] else '❌ NO VIABLE']
    ]
    
    producto_table = Table(producto_data, colWidths=[2*inch, 4*inch])
    producto_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#f3f4f6')),
        ('TEXTCOLOR', (0, 0), (-1, -1), colors.black),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 0), (-1, -1), 11),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 12),
        ('BACKGROUND', (0, 1), (-1, -1), colors.white),
        ('GRID', (0, 0), (-1, -1), 1, colors.HexColor('#e5e7eb'))
    ]))
    
    story.append(producto_table)
    story.append(Spacer(1, 20))
    
    # Análisis de precios
    story.append(Paragraph("💰 Análisis de Precios", subtitle_style))
    
    precios_data = [
        ['Concepto', 'Valor Unitario', 'Valor Total'],
        ['Precio de compra', f"${datos_resultado['precios']['compra']}", f"${datos_resultado['costos']['producto_total']}"],
        ['Precio de venta (ML)', f"${datos_resultado['precios']['venta']}", f"${datos_resultado['precios']['venta'] * datos_resultado['cantidad']}"],
        ['Ganancia bruta unitaria', f"${datos_resultado['precios']['ganancia_bruta_unitaria']}", '-'],
        ['Ganancia neta unitaria', f"${datos_resultado['precios']['ganancia_neta_unitaria']}", '-']
    ]
    
    precios_table = Table(precios_data, colWidths=[2.5*inch, 1.5*inch, 1.5*inch])
    precios_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#10b981')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 0), (-1, -1), 11),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 12),
        ('BACKGROUND', (0, 1), (-1, -1), colors.white),
        ('GRID', (0, 0), (-1, -1), 1, colors.HexColor('#e5e7eb'))
    ]))
    
    story.append(precios_table)
    story.append(Spacer(1, 20))
    
    # Desglose de costos
    story.append(Paragraph("📋 Desglose de Costos", subtitle_style))
    
    costos_data = [
        ['Concepto', 'Monto', 'Porcentaje'],
        ['Costo del producto', f"${datos_resultado['costos']['producto_total']}", f"{(datos_resultado['costos']['producto_total']/datos_resultado['costos']['costo_total']*100):.1f}%"],
        ['Impuestos totales', f"${datos_resultado['costos']['impuestos_total']}", f"{(datos_resultado['costos']['impuestos_total']/datos_resultado['costos']['costo_total']*100):.1f}%"],
        ['Costos de envío', f"${datos_resultado['costos']['envio_total']}", f"{(datos_resultado['costos']['envio_total']/datos_resultado['costos']['costo_total']*100):.1f}%"],
        ['Costos fijos', f"${datos_resultado['costos']['costos_fijos']}", f"{(datos_resultado['costos']['costos_fijos']/datos_resultado['costos']['costo_total']*100):.1f}%"],
        ['TOTAL', f"${datos_resultado['costos']['costo_total']}", '100%']
    ]
    
    costos_table = Table(costos_data, colWidths=[2.5*inch, 1.5*inch, 1.5*inch])
    costos_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#ef4444')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('BACKGROUND', (0, -1), (-1, -1), colors.HexColor('#fee2e2')),
        ('FONTNAME', (0, -1), (-1, -1), 'Helvetica-Bold'),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTNAME', (0, 1), (-1, -2), 'Helvetica'),
        ('FONTSIZE', (0, 0), (-1, -1), 11),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 12),
        ('BACKGROUND', (0, 1), (-1, -2), colors.white),
        ('GRID', (0, 0), (-1, -1), 1, colors.HexColor('#e5e7eb'))
    ]))
    
    story.append(costos_table)
    story.append(Spacer(1, 20))
    
    # Resultados finales
    story.append(PageBreak())
    story.append(Paragraph("🎯 Resultados Finales", subtitle_style))
    
    color_resultado = colors.HexColor('#10b981') if datos_resultado['viabilidad'] else colors.HexColor('#ef4444')
    
    resultados_data = [
        ['Concepto', 'Valor'],
        ['Venta bruta total', f"${datos_resultado['resultados']['venta_bruta']}"],
        ['Costo total', f"${datos_resultado['costos']['costo_total']}"],
        ['Ganancia/Pérdida total', f"${datos_resultado['resultados']['ganancia_total']}"],
        ['Porcentaje de ganancia', f"{datos_resultado['resultados']['porcentaje_ganancia']}%"],
        ['Comisión Mercado Libre', f"{datos_resultado['resultados']['comision_ml']}%"]
    ]
    
    resultados_table = Table(resultados_data, colWidths=[3*inch, 2*inch])
    resultados_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), color_resultado),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 0), (-1, -1), 12),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 12),
        ('BACKGROUND', (0, 1), (-1, -1), colors.white),
        ('GRID', (0, 0), (-1, -1), 1, colors.HexColor('#e5e7eb'))
    ]))
    
    story.append(resultados_table)
    story.append(Spacer(1, 30))
    
    # Conclusión
    conclusion_text = "✅ El producto ES VIABLE para importar." if datos_resultado['viabilidad'] else "❌ El producto NO ES VIABLE para importar."
    conclusion_style = ParagraphStyle(
        'Conclusion',
        parent=styles['Normal'],
        fontSize=14,
        alignment=TA_CENTER,
        textColor=color_resultado,
        fontName='Helvetica-Bold'
    )
    
    story.append(Paragraph(conclusion_text, conclusion_style))
    
    # Generar PDF
    doc.build(story)
    buffer.seek(0)
    return buffer

@app.route("/api/calcular", methods=["POST"])
def api_calcular():
    datos = request.json
    resultado = calcular_viabilidad(datos)
    
    # Generar PDF
    pdf_buffer = generar_pdf(resultado)
    producto = datos['producto'].replace(" ", "_").replace("/", "_")
    nombre_archivo = f"{producto}_informe.pdf"
    
    # Guardar PDF temporalmente
    with open(nombre_archivo, "wb") as f:
        f.write(pdf_buffer.getvalue())
    
    resultado['nombre_archivo'] = nombre_archivo
    return jsonify(resultado)

@app.route("/api/descargar/<nombre_archivo>")
def api_descargar(nombre_archivo):
    ruta = os.path.join(os.getcwd(), nombre_archivo)
    return send_file(ruta, as_attachment=True)

if __name__ == "__main__":
    app.run(debug=True)
