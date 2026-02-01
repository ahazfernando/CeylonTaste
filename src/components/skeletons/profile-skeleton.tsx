import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function ProfileSkeleton() {
  return (
    <div className="space-y-8">
      {/* Profile header */}
      <Card className="border border-white/10 bg-black">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <Skeleton className="h-20 w-20 rounded-full bg-white/10" />
              <div className="space-y-2">
                <Skeleton className="h-8 w-48 bg-white/10" />
                <Skeleton className="h-4 w-64 bg-white/10" />
              </div>
            </div>
            <Skeleton className="h-20 w-28 rounded-lg bg-white/10" />
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <div className="space-y-4">
        <Skeleton className="h-11 w-full rounded-lg bg-white/10" />
        <Card className="border border-white/10 bg-black">
          <CardHeader>
            <Skeleton className="h-6 w-32 bg-white/10" />
            <Skeleton className="h-4 w-64 bg-white/10" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-lg border border-white/10">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-24 bg-white/10" />
                    <Skeleton className="h-3 w-48 bg-white/10" />
                    <Skeleton className="h-3 w-20 bg-white/10" />
                  </div>
                  <div className="flex items-center gap-4">
                    <Skeleton className="h-6 w-16 rounded-full bg-white/10" />
                    <Skeleton className="h-5 w-20 bg-white/10" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
