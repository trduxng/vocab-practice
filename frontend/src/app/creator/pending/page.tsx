import CreatorWorkflowList from "@/src/components/creator/CreatorWorkflowList";

export default function CreatorPendingPage() {
  return <CreatorWorkflowList status="PendingReview" title="Chờ duyệt" description="Nội dung đang chờ Admin xem xét và không thể chỉnh sửa." />;
}
