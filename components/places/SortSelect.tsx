'use client';

export default function SortSelect({ current }: { current?: string }) {
  return (
    <form method="GET">
      <select
        name="sort"
        defaultValue={current ?? 'created_at'}
        onChange={(e) => {
          const form = e.currentTarget.form;
          if (form) form.submit();
        }}
        className="input-field w-auto text-sm py-2"
      >
        <option value="created_at">Шинэ эхэнд</option>
        <option value="rating_avg">Үнэлгээгээр</option>
        <option value="view_count">Үзэлтээр</option>
        <option value="price_per_night">Үнээр</option>
      </select>
    </form>
  );
}
