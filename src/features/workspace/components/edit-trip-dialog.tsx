"use client";

import { useMemo, useState } from "react";
import { MapPin, Pencil, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/toast";
import { useUpdateTripMetaMutation } from "@/features/workspace/hooks/use-update-trip-meta-mutation";
import { useWorkspaceBoardStore } from "@/store/workspace-board-store";
import type { TripDestination } from "@/types/trip";
import type { WorkspaceTrip } from "@/types/workspace";

type DestinationDraft = {
  city: string;
  country: string;
};

function createEmptyDestinationDraft(): DestinationDraft {
  return {
    city: "",
    country: "",
  };
}

function toDraftRows(destinations: TripDestination[]): DestinationDraft[] {
  if (destinations.length === 0) {
    return [createEmptyDestinationDraft()];
  }

  return destinations.map(([city, country]) => ({
    city,
    country,
  }));
}

function normalizeDestinations(rows: DestinationDraft[]): TripDestination[] {
  return rows
    .map(({ city, country }) => [city.trim(), country.trim()] as TripDestination)
    .filter(([city, country]) => city.length > 0 && country.length > 0);
}

export function EditTripDialog({
  trip,
  disabled,
}: {
  trip: WorkspaceTrip;
  disabled: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState(trip.title);
  const [destinationRows, setDestinationRows] = useState<DestinationDraft[]>(toDraftRows(trip.destinations));
  const updateTripMetaMutation = useUpdateTripMetaMutation();
  const updateTripMetaInStore = useWorkspaceBoardStore((state) => state.updateTripMeta);

  const parsedDestinations = useMemo(() => normalizeDestinations(destinationRows), [destinationRows]);
  const validationMessage = useMemo(() => {
    if (!title.trim()) {
      return "여행 제목을 입력해 주세요.";
    }

    return null;
  }, [title]);

  const handleDestinationRowChange =
    (index: number, field: keyof DestinationDraft) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value;
      setDestinationRows((current) =>
        current.map((row, rowIndex) =>
          rowIndex === index
            ? {
                ...row,
                [field]: value,
              }
            : row
        )
      );
    };

  const handleAddDestinationRow = () => {
    setDestinationRows((current) => [...current, createEmptyDestinationDraft()]);
  };

  const handleRemoveDestinationRow = (index: number) => {
    setDestinationRows((current) => {
      if (current.length === 1) {
        return [createEmptyDestinationDraft()];
      }

      return current.filter((_, rowIndex) => rowIndex !== index);
    });
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (validationMessage) {
      toast.error(validationMessage);
      return;
    }

    const primaryDestination = parsedDestinations[0]
      ? parsedDestinations[0].filter(Boolean).join(", ")
      : null;

    try {
      await updateTripMetaMutation.mutateAsync({
        tripId: trip.id,
        title: title.trim(),
        destination: primaryDestination,
        destinations: parsedDestinations,
      });

      updateTripMetaInStore({
        title: title.trim(),
        destination: primaryDestination,
        destinations: parsedDestinations,
      });
      setOpen(false);
      toast.success("여행 정보가 업데이트되었습니다.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "여행 정보 업데이트에 실패했습니다.");
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);

        if (nextOpen) {
          setTitle(trip.title);
          setDestinationRows(toDraftRows(trip.destinations));
        }
      }}
    >
      <DialogTrigger asChild>
        <Button type="button" variant="ghost" size="icon" disabled={disabled} aria-label="여행 정보 수정">
          <Pencil className="size-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>여행 정보 수정</DialogTitle>
          <DialogDescription>여행 제목과 목적지 정보를 업데이트합니다.</DialogDescription>
        </DialogHeader>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="edit-trip-title">
              여행 제목
            </label>
            <Input
              id="edit-trip-title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="예: 영월 단종 투어"
              maxLength={80}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between gap-3">
              <label className="text-sm font-medium">목적지</label>
              <Button type="button" variant="outline" size="sm" onClick={handleAddDestinationRow}>
                <Plus className="size-4" />
                경유지 추가
              </Button>
            </div>
            <div className="space-y-3">
              {destinationRows.map((row, index) => (
                <div key={`edit-destination-row-${index}`} className="flex items-start gap-2">
                  <Input
                    value={row.city}
                    onChange={handleDestinationRowChange(index, "city")}
                    placeholder="도시"
                    maxLength={40}
                  />
                  <Input
                    value={row.country}
                    onChange={handleDestinationRowChange(index, "country")}
                    placeholder="국가"
                    maxLength={40}
                  />
                  {index === 0 ? (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      disabled
                      tabIndex={-1}
                      aria-hidden="true"
                      className="pointer-events-none opacity-70"
                    >
                      <MapPin className="size-4" />
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveDestinationRow(index)}
                      aria-label={`목적지 ${index + 1} 삭제`}
                    >
                      <X className="size-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {validationMessage ? <p className="text-sm text-destructive">{validationMessage}</p> : null}

          <DialogFooter className="pt-2 sm:justify-end">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={updateTripMetaMutation.isPending}>
              취소
            </Button>
            <Button type="submit" disabled={Boolean(validationMessage) || updateTripMetaMutation.isPending}>
              {updateTripMetaMutation.isPending ? "저장 중..." : "저장"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
