from datetime import date
from io import BytesIO
from typing import List

from openpyxl import Workbook
from openpyxl.styles import Font
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4, landscape
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle

from app.models.transaction import Transaction

TYPE_LABELS = {
    "income": "Receita",
    "expense": "Despesa",
    "investment": "Investimento",
    "transfer": "Transferência",
    "savings": "Poupança",
}


def _enum_value(v):
    return v.value if hasattr(v, "value") else v


def _row_fields(t: Transaction):
    currency = _enum_value(t.account.currency) if t.account else ""
    type_label = TYPE_LABELS.get(_enum_value(t.type), _enum_value(t.type))
    dest_name = t.destination_account.name if t.destination_account else ""
    dest_currency = _enum_value(t.destination_account.currency) if t.destination_account else ""
    return {
        "date": t.date,
        "time": t.time,
        "description": t.description or "",
        "category": t.category.name if t.category else "",
        "type_label": type_label,
        "account": t.account.name if t.account else "",
        "amount": t.amount,
        "currency": currency,
        "dest_name": dest_name,
        "dest_amount": t.destination_amount,
        "dest_currency": dest_currency,
    }


def build_transactions_xlsx(rows: List[Transaction]) -> bytes:
    wb = Workbook()
    ws = wb.active
    ws.title = "Transações"
    headers = ["Data", "Hora", "Descrição", "Categoria", "Tipo", "Conta", "Valor", "Moeda", "Conta Destino", "Valor Destino"]
    ws.append(headers)
    for cell in ws[1]:
        cell.font = Font(bold=True)

    for t in rows:
        f = _row_fields(t)
        ws.append(
            [
                f["date"].isoformat(),
                f["time"].strftime("%H:%M") if f["time"] else "",
                f["description"],
                f["category"],
                f["type_label"],
                f["account"],
                f["amount"],
                f["currency"],
                f["dest_name"],
                f["dest_amount"] if f["dest_amount"] is not None else "",
            ]
        )

    for col_cells in ws.columns:
        length = max((len(str(c.value)) for c in col_cells if c.value is not None), default=10)
        ws.column_dimensions[col_cells[0].column_letter].width = min(max(length + 2, 10), 40)

    buffer = BytesIO()
    wb.save(buffer)
    return buffer.getvalue()


def build_transactions_pdf(rows: List[Transaction], start_date: date, end_date: date) -> bytes:
    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=landscape(A4), topMargin=15 * mm, bottomMargin=15 * mm)
    styles = getSampleStyleSheet()
    elements = [
        Paragraph("FinControl — Transações", styles["Title"]),
        Paragraph(f"Período: {start_date.strftime('%d/%m/%Y')} a {end_date.strftime('%d/%m/%Y')}", styles["Normal"]),
        Spacer(1, 8),
    ]

    data = [["Data", "Descrição", "Categoria", "Tipo", "Conta", "Valor", "Destino"]]
    for t in rows:
        f = _row_fields(t)
        amount_label = f"{f['amount']:,.2f} {f['currency']}"
        dest_label = "-"
        if f["dest_name"]:
            dest_label = f["dest_name"]
            if f["dest_amount"] is not None:
                dest_label += f" ({f['dest_amount']:,.2f} {f['dest_currency']})"
        data.append(
            [
                f["date"].strftime("%d/%m/%Y"),
                f["description"] or "-",
                f["category"] or "-",
                f["type_label"],
                f["account"] or "-",
                amount_label,
                dest_label,
            ]
        )

    table = Table(data, repeatRows=1)
    table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#4f46e5")),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
                ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                ("FONTSIZE", (0, 0), (-1, -1), 8),
                ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#e5e7eb")),
                ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#f9fafb")]),
                ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
                ("ALIGN", (5, 1), (5, -1), "RIGHT"),
            ]
        )
    )
    elements.append(table)

    doc.build(elements)
    return buffer.getvalue()
