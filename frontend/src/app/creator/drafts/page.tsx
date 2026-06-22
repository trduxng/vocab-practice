import CreatorWorkflowList from "@/src/components/creator/CreatorWorkflowList";

export default function CreatorDraftsPage() {
  return <CreatorWorkflowList status="Draft" title="Bản nháp" description="Nội dung đang chỉnh sửa và chưa gửi Admin duyệt." allowSubmit />;
}
