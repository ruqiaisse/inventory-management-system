import { useMemo } from "react";
import { usePermissionContext } from "../context/PermissionContext";

const usePermission = () => {
  const { permissions } = usePermissionContext();

  const can = useMemo(
    () => (action) => !!permissions[action],
    [permissions]
  );

  return { can };
};

export default usePermission;