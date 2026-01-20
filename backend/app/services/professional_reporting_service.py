"""Professional Reporting Service - B2B analytics and reporting."""

from __future__ import annotations

from typing import Dict, List, Optional
from datetime import datetime, timedelta
from collections import defaultdict, Counter
from io import BytesIO

try:
    from reportlab.lib.pagesizes import letter, A4
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.lib.units import inch
    from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak
    from reportlab.lib import colors
    REPORTLAB_AVAILABLE = True
except ImportError:
    REPORTLAB_AVAILABLE = False


class ProfessionalReportingService:
    """
    B2B reporting service for employers and institutions.
    
    Features:
    - Cohort analytics
    - Progress tracking
    - CEFR distribution
    - Workplace scenario performance
    - Report export (PDF/CSV)
    """
    
    def __init__(self):
        # In-memory storage (would be database in production)
        self.cohorts = {}  # cohort_id -> cohort_data
        self.user_progress = {}  # user_id -> progress_data
        self.user_profiles = {}  # user_id -> metadata
        self._seed_demo_data()

    def _seed_demo_data(self):
        """Populate in-memory demo data for dashboards."""
        if self.user_progress:
            return
        
        now = datetime.now()
        demo_users = {
            "user123": {
                "name": "Mika Student",
                "predicted_cefr": "B1.1",
                "sessions": 24,
                "messages_count": 180,
                "average_accuracy": 0.78,
                "pronunciation_score": 3.2,
                "last_activity": (now - timedelta(hours=5)).isoformat(),
                "workplace": {
                    "sairaanhoitaja": {"average_score": 4.2},
                    "ict": {"average_score": 3.5},
                },
                "grammar_errors": {"partitive": 4, "verb ending": 3, "word order": 2},
            },
            "user456": {
                "name": "Liisa Learner",
                "predicted_cefr": "A2.2",
                "sessions": 12,
                "messages_count": 90,
                "average_accuracy": 0.62,
                "pronunciation_score": 2.6,
                "last_activity": (now - timedelta(days=1)).isoformat(),
                "workplace": {
                    "hoiva-avustaja": {"average_score": 3.1},
                },
                "grammar_errors": {"partitive": 6, "case ending": 4},
            },
        }
        
        for user_id, data in demo_users.items():
            self.user_profiles[user_id] = {"name": data.get("name", user_id)}
            self.user_progress[user_id] = {
                "predicted_cefr": data.get("predicted_cefr", "A1"),
                "sessions": data.get("sessions", 0),
                "messages_count": data.get("messages_count", 0),
                "average_accuracy": data.get("average_accuracy", 0),
                "pronunciation_score": data.get("pronunciation_score", 0),
                "workplace": data.get("workplace", {}),
                "grammar_errors": data.get("grammar_errors", {}),
                "last_activity": data.get("last_activity"),
            }
        
        self.create_cohort(
            "cohort_health",
            "Healthcare Workers Q1",
            ["user123", "user456"],
        )
        self.create_cohort(
            "cohort_ict",
            "ICT Professionals",
            ["user123"],
        )
    
    async def get_cohort_analytics(
        self,
        cohort_id: str,
        date_range: Optional[Dict] = None,
    ) -> Dict:
        """
        Get analytics for a cohort (group of users).
        
        Returns:
            - User count
            - Active users
            - Average progress
            - CEFR distribution
            - Workplace performance
            - Engagement metrics
        """
        cohort = self.cohorts.get(cohort_id, {})
        users = cohort.get("users", [])
        
        if not users:
            return {
                "cohort_id": cohort_id,
                "user_count": 0,
                "active_users": 0,
                "error": "Cohort not found or empty",
            }
        
        # Calculate metrics
        active_users = await self._count_active_users(users, date_range)
        progress_data = self._aggregate_progress(users)
        cefr_distribution = self._calculate_cefr_distribution(users)
        workplace_performance = self._aggregate_workplace_performance(users)
        engagement = await self._calculate_engagement(users, date_range)
        
        return {
            "cohort_id": cohort_id,
            "cohort_name": cohort.get("name", "Unnamed Cohort"),
            "user_count": len(users),
            "active_users": active_users,
            "date_range": date_range or {"start": None, "end": None},
            "progress": progress_data,
            "cefr_distribution": cefr_distribution,
            "workplace_performance": workplace_performance,
            "engagement": engagement,
            "generated_at": datetime.now().isoformat(),
        }
    
    async def _count_active_users(self, users: List[str], date_range: Optional[Dict]) -> int:
        """Count users active in date range."""
        if not users:
            return 0
        
        try:
            # Determine date range
            now = datetime.now()
            if date_range:
                start_date = date_range.get("start")
                end_date = date_range.get("end")
                if start_date:
                    start_date = datetime.fromisoformat(start_date) if isinstance(start_date, str) else start_date
                if end_date:
                    end_date = datetime.fromisoformat(end_date) if isinstance(end_date, str) else end_date
            else:
                # Default to last 30 days
                start_date = now - timedelta(days=30)
                end_date = now
            
            async for session in get_session():
                # Count users who have any activity (usage logs, grammar logs, or pronunciation logs)
                # in the date range
                query = select(distinct(UsageLog.user_id)).where(
                    and_(
                        UsageLog.user_id.in_(users),
                        UsageLog.created_at >= start_date if start_date else True,
                        UsageLog.created_at <= end_date if end_date else True,
                    )
                )
                
                result = await session.execute(query)
                active_user_ids = set(result.scalars().all())
                
                # Also check grammar and pronunciation logs
                grammar_query = select(distinct(GrammarLog.user_id)).where(
                    and_(
                        GrammarLog.user_id.in_(users),
                        GrammarLog.created_at >= start_date if start_date else True,
                        GrammarLog.created_at <= end_date if end_date else True,
                    )
                )
                grammar_result = await session.execute(grammar_query)
                active_user_ids.update(grammar_result.scalars().all())
                
                pron_query = select(distinct(PronunciationLog.user_id)).where(
                    and_(
                        PronunciationLog.user_id.in_(users),
                        PronunciationLog.created_at >= start_date if start_date else True,
                        PronunciationLog.created_at <= end_date if end_date else True,
                    )
                )
                pron_result = await session.execute(pron_query)
                active_user_ids.update(pron_result.scalars().all())
                
                return len(active_user_ids)
        except Exception:
            # Fallback: estimate based on in-memory data
            return len([uid for uid in users if self.user_progress.get(uid, {}).get("last_activity")])
    
    def _aggregate_progress(self, users: List[str]) -> Dict:
        """Aggregate progress metrics across users."""
        all_progress = [self.user_progress.get(uid, {}) for uid in users]
        
        # Calculate averages
        avg_sessions = sum(p.get("sessions", 0) for p in all_progress) / len(users) if users else 0
        avg_messages = sum(p.get("messages_count", 0) for p in all_progress) / len(users) if users else 0
        avg_accuracy = sum(p.get("average_accuracy", 0) for p in all_progress) / len(users) if users else 0
        
        return {
            "average_sessions": round(avg_sessions, 1),
            "average_messages": round(avg_messages, 1),
            "average_accuracy": round(avg_accuracy, 2),
            "total_sessions": sum(p.get("sessions", 0) for p in all_progress),
            "total_messages": sum(p.get("messages_count", 0) for p in all_progress),
        }
    
    def _calculate_cefr_distribution(self, users: List[str]) -> Dict:
        """Calculate CEFR level distribution."""
        levels = []
        for uid in users:
            progress = self.user_progress.get(uid, {})
            predicted_level = progress.get("predicted_cefr", "A1")
            levels.append(predicted_level)
        
        distribution = Counter(levels)
        
        return {
            "A1": distribution.get("A1", 0),
            "A2.1": distribution.get("A2.1", 0),
            "A2.2": distribution.get("A2.2", 0),
            "B1.1": distribution.get("B1.1", 0),
            "B1.2": distribution.get("B1.2", 0),
            "total": len(users),
        }
    
    def _aggregate_workplace_performance(self, users: List[str]) -> Dict:
        """Aggregate workplace scenario performance."""
        profession_scores = defaultdict(list)
        
        for uid in users:
            progress = self.user_progress.get(uid, {})
            workplace_data = progress.get("workplace", {})
            
            for profession, scores in workplace_data.items():
                if isinstance(scores, dict) and "average_score" in scores:
                    profession_scores[profession].append(scores["average_score"])
        
        # Calculate averages per profession
        profession_averages = {}
        for profession, scores in profession_scores.items():
            if scores:
                profession_averages[profession] = {
                    "average_score": sum(scores) / len(scores),
                    "user_count": len(scores),
                }
        
        return profession_averages
    
    def _calculate_engagement(self, users: List[str], date_range: Optional[Dict]) -> Dict:
        """Calculate engagement metrics."""
        # TODO: Query actual activity data
        # For now, return estimates
        
        return {
            "daily_active_users": len(users) * 0.3,  # 30% daily active
            "weekly_active_users": len(users) * 0.6,  # 60% weekly active
            "average_session_duration": 15,  # minutes
            "average_sessions_per_week": 3.5,
        }
    
    def list_cohorts(self) -> List[Dict]:
        """Return available cohorts."""
        return list(self.cohorts.values())
    
    def list_users(self, cohort_id: Optional[str] = None) -> List[Dict]:
        """Return users, optionally filtered by cohort."""
        users = []
        cohort_users = None
        if cohort_id and cohort_id in self.cohorts:
            cohort_users = set(self.cohorts[cohort_id].get("users", []))
        
        for user_id, progress in self.user_progress.items():
            if cohort_users is not None and user_id not in cohort_users:
                continue
            profile = self.user_profiles.get(user_id, {})
            users.append({
                "id": user_id,
                "name": profile.get("name", user_id),
                "cohorts": [c for c, data in self.cohorts.items() if user_id in data.get("users", [])],
                "predicted_cefr": progress.get("predicted_cefr", "A1"),
            })
        return users
    
    async def generate_cohort_report(
        self,
        cohort_id: str,
        format: str = "json",  # json, csv, pdf
        date_range: Optional[Dict] = None,
    ) -> Dict:
        """Generate exportable cohort report."""
        analytics = await self.get_cohort_analytics(cohort_id, date_range)
        
        if format == "json":
            return analytics
        elif format == "csv":
            return self._format_as_csv(analytics)
        elif format == "pdf":
            return self._format_as_pdf(analytics)
        else:
            return analytics
    
    def _format_as_csv(self, analytics: Dict) -> Dict:
        """Format analytics as CSV."""
        lines = []
        
        # Header
        lines.append("Metric,Value")
        lines.append(f"User Count,{analytics.get('user_count', 0)}")
        lines.append(f"Active Users,{analytics.get('active_users', 0)}")
        
        # CEFR Distribution
        cefr = analytics.get("cefr_distribution", {})
        lines.append("")
        lines.append("CEFR Distribution,")
        for level, count in cefr.items():
            if level != "total":
                lines.append(f"{level},{count}")
        
        # Progress
        progress = analytics.get("progress", {})
        lines.append("")
        lines.append("Progress Metrics,")
        lines.append(f"Average Sessions,{progress.get('average_sessions', 0)}")
        lines.append(f"Average Messages,{progress.get('average_messages', 0)}")
        lines.append(f"Average Accuracy,{progress.get('average_accuracy', 0)}")
        
        csv_content = "\n".join(lines)
        
        return {
            "format": "csv",
            "content": csv_content,
            "filename": f"cohort_report_{analytics.get('cohort_id', 'unknown')}_{datetime.now().strftime('%Y%m%d')}.csv",
        }
    
    def _format_as_pdf(self, analytics: Dict) -> Dict:
        """Format analytics as PDF report."""
        if not REPORTLAB_AVAILABLE:
            return {
                "format": "pdf",
                "error": "reportlab not installed. Install with: pip install reportlab",
                "data": analytics,
            }
        
        try:
            buffer = BytesIO()
            doc = SimpleDocTemplate(buffer, pagesize=A4)
            story = []
            styles = getSampleStyleSheet()
            
            # Title
            title_style = ParagraphStyle(
                'CustomTitle',
                parent=styles['Heading1'],
                fontSize=24,
                textColor=colors.HexColor('#1a1a1a'),
                spaceAfter=30,
            )
            story.append(Paragraph(f"Cohort Report: {analytics.get('cohort_name', 'Unknown')}", title_style))
            story.append(Spacer(1, 0.2*inch))
            
            # Summary section
            story.append(Paragraph("Summary", styles['Heading2']))
            summary_data = [
                ["Metric", "Value"],
                ["Cohort ID", analytics.get('cohort_id', 'N/A')],
                ["User Count", str(analytics.get('user_count', 0))],
                ["Active Users", str(analytics.get('active_users', 0))],
                ["Generated At", analytics.get('generated_at', 'N/A')],
            ]
            summary_table = Table(summary_data, colWidths=[3*inch, 2*inch])
            summary_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, 0), 12),
                ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
                ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
                ('GRID', (0, 0), (-1, -1), 1, colors.black),
            ]))
            story.append(summary_table)
            story.append(Spacer(1, 0.3*inch))
            
            # CEFR Distribution
            story.append(Paragraph("CEFR Distribution", styles['Heading2']))
            cefr = analytics.get('cefr_distribution', {})
            cefr_data = [["CEFR Level", "Count"]]
            for level in ["A1", "A2.1", "A2.2", "B1.1", "B1.2"]:
                count = cefr.get(level, 0)
                cefr_data.append([level, str(count)])
            
            cefr_table = Table(cefr_data, colWidths=[2*inch, 1*inch])
            cefr_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, 0), 12),
                ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
                ('BACKGROUND', (0, 1), (-1, -1), colors.lightgrey),
                ('GRID', (0, 0), (-1, -1), 1, colors.black),
            ]))
            story.append(cefr_table)
            story.append(Spacer(1, 0.3*inch))
            
            # Progress Metrics
            story.append(Paragraph("Progress Metrics", styles['Heading2']))
            progress = analytics.get('progress', {})
            progress_data = [
                ["Metric", "Value"],
                ["Average Sessions", f"{progress.get('average_sessions', 0):.1f}"],
                ["Average Messages", f"{progress.get('average_messages', 0):.1f}"],
                ["Average Accuracy", f"{progress.get('average_accuracy', 0):.2%}"],
                ["Total Sessions", str(progress.get('total_sessions', 0))],
                ["Total Messages", str(progress.get('total_messages', 0))],
            ]
            progress_table = Table(progress_data, colWidths=[3*inch, 2*inch])
            progress_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, 0), 12),
                ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
                ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
                ('GRID', (0, 0), (-1, -1), 1, colors.black),
            ]))
            story.append(progress_table)
            
            # Build PDF
            doc.build(story)
            buffer.seek(0)
            pdf_content = buffer.getvalue()
            buffer.close()
            
            return {
                "format": "pdf",
                "content": pdf_content,
                "filename": f"cohort_report_{analytics.get('cohort_id', 'unknown')}_{datetime.now().strftime('%Y%m%d')}.pdf",
                "mime_type": "application/pdf",
            }
        except Exception as e:
            return {
                "format": "pdf",
                "error": f"PDF generation failed: {str(e)}",
                "data": analytics,
            }
    
    async def get_user_progress_report(self, user_id: str) -> Dict:
        """Get detailed progress report for a single user."""
        progress = self.user_progress.get(user_id, {})
        
        return {
            "user_id": user_id,
            "predicted_cefr": progress.get("predicted_cefr", "A1"),
            "sessions": progress.get("sessions", 0),
            "messages_count": progress.get("messages_count", 0),
            "average_accuracy": progress.get("average_accuracy", 0),
            "workplace_performance": progress.get("workplace", {}),
            "grammar_errors": progress.get("grammar_errors", {}),
            "pronunciation_score": progress.get("pronunciation_score", 0),
            "last_activity": progress.get("last_activity"),
            "generated_at": datetime.now().isoformat(),
        }
    
    def create_cohort(self, cohort_id: str, name: str, user_ids: List[str]) -> Dict:
        """Create a new cohort."""
        self.cohorts[cohort_id] = {
            "id": cohort_id,
            "name": name,
            "users": user_ids,
            "created_at": datetime.now().isoformat(),
        }
        
        return self.cohorts[cohort_id]
    
    def add_user_to_cohort(self, cohort_id: str, user_id: str) -> bool:
        """Add user to cohort."""
        if cohort_id not in self.cohorts:
            return False
        
        if user_id not in self.cohorts[cohort_id]["users"]:
            self.cohorts[cohort_id]["users"].append(user_id)
        
        return True


# Global instance
_professional_reporting = ProfessionalReportingService()


async def get_cohort_analytics(cohort_id: str, date_range: Optional[Dict] = None) -> Dict:
    """Get cohort analytics."""
    return await _professional_reporting.get_cohort_analytics(cohort_id, date_range)

async def generate_cohort_report(
    cohort_id: str,
    format: str = "json",
    date_range: Optional[Dict] = None,
) -> Dict:
    """Generate cohort report."""
    return await _professional_reporting.generate_cohort_report(cohort_id, format, date_range)


async def get_user_progress_report(user_id: str) -> Dict:
    """Get user progress report."""
    return await _professional_reporting.get_user_progress_report(user_id)


async def list_cohorts() -> List[Dict]:
    """List all cohorts."""
    return _professional_reporting.list_cohorts()


async def list_users(cohort_id: Optional[str] = None) -> List[Dict]:
    """List users, optionally by cohort."""
    return _professional_reporting.list_users(cohort_id)
