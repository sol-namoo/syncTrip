export default function TripsPage() {
  return (
    <section className="space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="space-y-2">
          <h1 className="text-4xl font-semibold tracking-tight">내 여행 일정</h1>
          <p className="text-base text-muted-foreground">친구들과 함께 계획하고 있는 여행들</p>
        </div>
        <button className="self-start rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-sm">
          + 새 여행 만들기
        </button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        <div className="min-h-[325px] rounded-[28px] border bg-card shadow-sm" />
        <div className="min-h-[325px] rounded-[28px] border bg-card shadow-sm" />
        <div className="flex min-h-[325px] items-center justify-center rounded-[28px] border border-dashed border-border bg-card text-center text-sm text-muted-foreground shadow-sm">
          새 여행 생성 영역
        </div>
      </div>
    </section>
  );
}
