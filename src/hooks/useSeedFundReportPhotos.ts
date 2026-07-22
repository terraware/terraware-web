import { useMemo } from 'react';

import { useListReportPhotosQuery } from 'src/queries/generated/seedFundReports';
import { SeedFundReportPhoto } from 'src/types/SeedFundReport';

/**
 * Lists the photos for a SeedFund report.
 */
const useSeedFundReportPhotos = (reportId?: number) => {
  const response = useListReportPhotosQuery(reportId as number, { skip: reportId === undefined });

  const photos: SeedFundReportPhoto[] = useMemo(() => response.currentData?.photos ?? [], [response.currentData]);

  return { photos, isLoading: response.isFetching, isError: response.isError };
};

export default useSeedFundReportPhotos;
