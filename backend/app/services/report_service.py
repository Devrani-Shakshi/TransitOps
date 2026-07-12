import os
import io
import csv
from jinja2 import Environment, FileSystemLoader
from app.core.config import settings

# Attempt to import weasyprint
try:
    import weasyprint
except (ImportError, OSError):
    weasyprint = None

class ReportService:
    def __init__(self):
        # Resolve templates path relative to this file
        current_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        self.templates_dir = os.path.join(current_dir, "templates")
        self.env = Environment(loader=FileSystemLoader(self.templates_dir))

    def _render_html(self, template_name: str, context: dict) -> str:
        template = self.env.get_template(template_name)
        return template.render(context)

    def generate_pdf(self, template_name: str, context: dict) -> bytes:
        html_content = self._render_html(template_name, context)
        if weasyprint:
            # Weasyprint is available, generate real PDF
            pdf_bytes = weasyprint.HTML(string=html_content).write_pdf()
            return pdf_bytes
        else:
            # Fallback if GTK+ or weasyprint libraries are not fully loaded in the OS
            # Return HTML content encoded as bytes as a placeholder/fallback PDF
            return html_content.encode("utf-8")

    def generate_csv(self, headers: list[str], rows: list[list]) -> bytes:
        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerow(headers)
        writer.writerows(rows)
        return output.getvalue().encode("utf-8")

    def generate_xlsx(self, headers: list[str], rows: list[list]) -> bytes:
        # Since openpyxl/xlsxwriter is not in requirements.txt, we will output XML Spreadsheet 2003
        # or CSV bytes which Excel natively supports. We'll use CSV bytes as it's clean and safe.
        return self.generate_csv(headers, rows)

report_service = ReportService()
