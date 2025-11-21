import { Button } from '@/components/ui/button';
import React from 'react';

interface PaginationProps {
  currentPage: number;
  lastPage: number;
  loading: boolean;
  goToPage: (page: number) => void;
}

export default function Pagination({ currentPage, lastPage, loading, goToPage }: PaginationProps) {
  return (
    <div className="flex justify-center items-center gap-2 py-4">
      <Button
        variant="outline"
        disabled={currentPage === 1 || loading}
        onClick={() => goToPage(currentPage - 1)}
        className="cursor-pointer"
      >
        Prev
      </Button>
      <span className="text-sm">
        Page {currentPage} of {lastPage || 1}
      </span>
      <Button
        variant="outline"
        disabled={currentPage === lastPage || loading}
        onClick={() => goToPage(currentPage + 1)}
        className="cursor-pointer"
      >
        Next
      </Button>
    </div>
  );
}
