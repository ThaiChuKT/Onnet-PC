import { Button } from "../ui/button";

type ListPaginationProps = {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
};

export function ListPagination({ page, totalPages, onPageChange, className }: ListPaginationProps) {
  if (totalPages <= 1) {
    return null;
  }

  const pages = Array.from({ length: totalPages }, (_, index) => index);

  return (
    <div className={className ?? "flex flex-wrap items-center justify-center gap-2"}>
      <Button variant="outline" size="sm" onClick={() => onPageChange(Math.max(0, page - 1))} disabled={page === 0}>
        Previous
      </Button>
      <div className="flex flex-wrap items-center gap-2">
        {pages.map((index) => (
          <Button
            key={index}
            variant={index === page ? "default" : "outline"}
            size="sm"
            onClick={() => onPageChange(index)}
          >
            {index + 1}
          </Button>
        ))}
      </div>
      <Button variant="outline" size="sm" onClick={() => onPageChange(Math.min(totalPages - 1, page + 1))} disabled={page >= totalPages - 1}>
        Next
      </Button>
    </div>
  );
}