"use client"

import { useMemo, useState } from "react"
import dayjs from "dayjs"
import { useRouter } from "next/navigation"
import { CalendarIcon, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { toast } from "@/components/ui/toast"
import { cn } from "@/lib/utils"
import { DATE_FORMAT, MAX_TRIP_DAYS } from "@/features/trips/constants"
import { useCreateTripMutation } from "@/features/trips/hooks/useCreateTripMutation"
import type { CreateTripInput } from "@/features/trips/types"

function getDurationDays(startDate: string, endDate: string) {
  return dayjs(endDate).diff(dayjs(startDate), "day") + 1
}

export function CreateTripDialog() {
  const router = useRouter()
  const createTripMutation = useCreateTripMutation()
  const today = dayjs().format(DATE_FORMAT)
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState<CreateTripInput>({
    title: "",
    destination: "",
    startDate: today,
    endDate: today,
  })

  const validationMessage = useMemo(() => {
    if (!form.title.trim()) {
      return "여행 제목을 입력해 주세요."
    }

    if (!form.startDate || !form.endDate) {
      return "여행 시작일과 종료일을 입력해 주세요."
    }

    if (dayjs(form.endDate).isBefore(dayjs(form.startDate), "day")) {
      return "종료일은 시작일보다 빠를 수 없습니다."
    }

    if (getDurationDays(form.startDate, form.endDate) > MAX_TRIP_DAYS) {
      return `여행 기간은 최대 ${MAX_TRIP_DAYS}일까지 가능합니다.`
    }

    return null
  }, [form.endDate, form.startDate, form.title])

  const handleChange =
    (field: keyof CreateTripInput) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value
      setForm((current) => {
        const next = {
          ...current,
          [field]: value,
        }

        if (field === "startDate" && dayjs(next.endDate).isBefore(dayjs(value), "day")) {
          next.endDate = value
        }

        return next
      })
    }

  const handleSelectDate = (field: "startDate" | "endDate", date?: Date) => {
    if (!date) {
      return
    }

    const value = dayjs(date).format(DATE_FORMAT)

    setForm((current) => {
      const next = {
        ...current,
        [field]: value,
      }

      if (field === "startDate" && dayjs(next.endDate).isBefore(dayjs(value), "day")) {
        next.endDate = value
      }

      return next
    })
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (validationMessage) {
      toast.error(validationMessage)
      return
    }

    try {
      const trip = await createTripMutation.mutateAsync({
        title: form.title.trim(),
        destination: form.destination.trim(),
        startDate: form.startDate,
        endDate: form.endDate,
      })

      setOpen(false)
      toast.success("새 여행이 생성되었습니다.")
      router.push(`/workspace/${trip.id}`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "여행 생성에 실패했습니다.")
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!createTripMutation.isPending) {
          setOpen(nextOpen)
        }
      }}
    >
      <DialogTrigger asChild>
        <Button className="self-start rounded-lg px-6 py-3 shadow-lg">
          <Plus className="size-5" />
          새 여행 만들기
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>새 여행 만들기</DialogTitle>
          <DialogDescription>
            제목과 기간을 입력하여 새 여행을 만들고 편집을 시작합니다.
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="title">
              여행 제목
            </label>
            <Input
              id="title"
              value={form.title}
              onChange={handleChange("title")}
              placeholder="예: 영월 단종 투어"
              maxLength={80}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="destination">
              목적지
            </label>
            <Input
              id="destination"
              value={form.destination}
              onChange={handleChange("destination")}
              placeholder="예: 영월, 한국"
              maxLength={80}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="startDate">
                시작일
              </label>
              <DateField
                id="startDate"
                value={form.startDate}
                onSelect={(date) => handleSelectDate("startDate", date)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="endDate">
                종료일
              </label>
              <DateField
                id="endDate"
                value={form.endDate}
                onSelect={(date) => handleSelectDate("endDate", date)}
              />
            </div>
          </div>

          <p className="text-xs text-muted-foreground">
            여행 기간은 시작일 포함 최대 {MAX_TRIP_DAYS}일까지 가능합니다.
          </p>
          {validationMessage ? (
            <p className="text-sm text-destructive">{validationMessage}</p>
          ) : null}

          <DialogFooter className="pt-2 sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={createTripMutation.isPending}
            >
              취소
            </Button>
            <Button type="submit" disabled={Boolean(validationMessage) || createTripMutation.isPending}>
              {createTripMutation.isPending ? "생성 중..." : "생성하고 편집 시작"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function DateField({
  id,
  value,
  onSelect,
}: {
  id: string
  value: string
  onSelect: (date?: Date) => void
}) {
  const selectedDate = value ? dayjs(value).toDate() : undefined

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          className={cn(
            "w-full justify-between text-left font-normal",
            !value && "text-muted-foreground",
          )}
        >
          {value ? dayjs(value).format("YYYY.MM.DD") : "날짜 선택"}
          <CalendarIcon className="size-4 opacity-60" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={onSelect}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  )
}
