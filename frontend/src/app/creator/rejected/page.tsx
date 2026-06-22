import CreatorWorkflowList from "@/src/components/creator/CreatorWorkflowList";

export default function CreatorRejectedPage() {
  return <CreatorWorkflowList status="Rejected" title="Nội dung bị từ chối" description="Xem lý do, chỉnh sửa nội dung rồi gửi lại Admin duyệt." allowSubmit />;
}
