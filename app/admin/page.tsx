import { auth } from "@/auth";
import { getAllContents } from "@/lib/content/queries";
import { ApprovalList } from "@/components/admin/approval-list";
import { Header } from "@/components/layout/header";

export default async function AdminPage() {
  const [contents, session] = await Promise.all([getAllContents(), auth()]);

  return (
    <>
      <Header
        session={session}
        title="Admin — อนุมัติ Content"
        description="ตรวจสอบและอนุมัติ Content ก่อนขึ้นปฏิทินและโพสต์อัตโนมัติ"
      />
      <div className="px-8 py-6">
        <ApprovalList contents={contents} />
      </div>
    </>
  );
}
