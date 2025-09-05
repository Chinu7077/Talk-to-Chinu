import React, { useState, useEffect } from 'react';
import { UserIdentification } from '@/utils/userIdentification';
import { Button } from '@/components/ui/button';
import { User, Eye, EyeOff } from 'lucide-react';

const UserInfo = () => {
  const [userId, setUserId] = useState<string>('');
  const [showFullId, setShowFullId] = useState(false);

  useEffect(() => {
    const loadUserId = async () => {
      const id = await UserIdentification.getUserId();
      setUserId(id);
    };
    loadUserId();
  }, []);

  const toggleIdVisibility = () => {
    setShowFullId(!showFullId);
  };

  const displayId = showFullId ? userId : userId.substring(0, 8) + '...';

  return (
    <div className="flex items-center gap-2 text-xs text-muted-foreground">
      <User className="w-3 h-3" />
      <span className="font-mono">
        {userId.startsWith('ip-') ? 'IP' : 'Device'}: {displayId}
      </span>
      <Button
        variant="ghost"
        size="sm"
        onClick={toggleIdVisibility}
        className="h-4 w-4 p-0"
        title={showFullId ? 'Hide full ID' : 'Show full ID'}
      >
        {showFullId ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
      </Button>
    </div>
  );
};

export default UserInfo;
