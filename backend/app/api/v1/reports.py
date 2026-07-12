from datetime import datetime, date
from fastapi import APIRouter, Depends, Query, Response, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.deps import get_db, get_current_user
from app.services.report_service import report_service
from app.services.analytics_service import analytics_service
from app.models.maintenance_log import MaintenanceLog

router = APIRouter()

@router.get("/executive-summary")
async def get_executive_summary_report(db: AsyncSession = Depends(get_db), current_user = Depends(get_current_user)):
    summary = await analytics_service.get_analytics_summary(db)
    context = {
        "generated_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "total_distance": summary.total_distance_covered,
        "health_score": round(summary.health.score, 2),
        "total_revenue": summary.roi.total_revenue,
        "total_expenses": summary.roi.total_expenses,
        "total_vehicles": summary.health.total_vehicles,
        "active_vehicles": summary.health.active_vehicles,
        "under_maintenance": summary.health.under_maintenance,
        "out_of_service": summary.health.out_of_service
    }
    pdf_data = report_service.generate_pdf("executive_summary.html", context)
    return Response(content=pdf_data, media_type="application/pdf", headers={"Content-Disposition": "attachment; filename=executive_summary.pdf"})

@router.get("/invoice/{invoice_num}")
async def get_invoice_report(invoice_num: str, client_name: str = "Client Name", amount: float = 100.0, db: AsyncSession = Depends(get_db), current_user = Depends(get_current_user)):
    context = {
        "invoice_number": invoice_num,
        "created_date": datetime.now().strftime("%Y-%m-%d"),
        "due_date": datetime.now().strftime("%Y-%m-%d"),
        "client_name": client_name,
        "client_email": "client@example.com",
        "items": [
            {"description": "Fleet Trip Dispatch Charge", "price": amount}
        ],
        "total_amount": amount
    }
    pdf_data = report_service.generate_pdf("invoice.html", context)
    return Response(content=pdf_data, media_type="application/pdf", headers={"Content-Disposition": f"attachment; filename=invoice_{invoice_num}.pdf"})

@router.get("/maintenance")
async def get_maintenance_report(start_date: date = Query(...), end_date: date = Query(...), db: AsyncSession = Depends(get_db), current_user = Depends(get_current_user)):
    result = await db.execute(
        select(MaintenanceLog).filter(
            MaintenanceLog.service_date.between(start_date, end_date),
            MaintenanceLog.is_deleted == False
        )
    )
    logs = result.scalars().all()
    
    logs_data = []
    total_cost = 0.0
    for l in logs:
        total_cost += l.cost
        logs_data.append({
            "vehicle_plate": l.vehicle.license_plate if l.vehicle else "N/A",
            "service_date": l.service_date.strftime("%Y-%m-%d"),
            "service_type": l.service_type,
            "description": l.description,
            "cost": l.cost,
            "status": l.status
        })
        
    context = {
        "start_date": start_date.strftime("%Y-%m-%d"),
        "end_date": end_date.strftime("%Y-%m-%d"),
        "total_cost": total_cost,
        "total_logs": len(logs),
        "logs": logs_data
    }
    pdf_data = report_service.generate_pdf("maintenance_report.html", context)
    return Response(content=pdf_data, media_type="application/pdf", headers={"Content-Disposition": "attachment; filename=maintenance_report.pdf"})
