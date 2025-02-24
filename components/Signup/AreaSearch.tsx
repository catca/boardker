import styled from 'styled-components';
import {
  ChangeEvent,
  Dispatch,
  KeyboardEvent,
  SetStateAction,
  useState,
} from 'react';
import Image from 'next/image';

import useGeolocation from 'hooks/local';
import { Typography } from 'components/UI/Typography/Typography';
import { Input } from 'components/UI/Input/Input';
import { useLocalInfos, useSearchAddress } from 'hooks/local';
import { Flex } from 'components/UI/Flex/Flex';
import { SingupParamsType } from 'types/uesr';
import { getCityName, getDistance, getDongName } from 'lib/local';
import { message } from 'antd';

const AreaSearchWrapper = styled(Flex)`
  padding: 16px 20px;
  border-bottom: 1px solid #e4e4e4;
`;

const AreaSearchResultWrapper = styled.div`
  padding: 16px 20px;
`;

const AreaSearch = ({
  onChangeIsAreaSearching,
  onChangeSignupParams,
}: {
  onChangeIsAreaSearching: Dispatch<SetStateAction<boolean>>;
  onChangeSignupParams: Dispatch<SetStateAction<SingupParamsType>>;
}) => {
  const [searchValue, setSearchValue] = useState('');
  const [searchedValue, setSearchedValue] = useState('');
  const location = useGeolocation();
  const { lat, lng } = location.coordinates || {};

  const { localInfos, isLoading } = useLocalInfos({
    enabled: location.loaded && location.coordinates !== undefined,
    lng,
    lat,
  });

  const { searchedLocalInfos } = useSearchAddress(searchedValue);

  const handleSearch = (e: KeyboardEvent) => {
    if (e.key === 'Enter') {
      setSearchedValue(searchValue);
    }
  };

  const check5kmInner = (x: string, y: string) => {
    const [targetLng, targetLat] = [Number(x), Number(y)];

    if (lat && lng) {
      const distance = getDistance({
        lat1: lat,
        lng1: lng,
        lat2: targetLat,
        lng2: targetLng,
      });

      if (distance > 5000) {
        return false;
      }

      return true;
    }
    return false;
  };

  return (
    <>
      <AreaSearchWrapper gap={4} align="center">
        <Image
          src="/icons/back.svg"
          alt="back"
          width={24}
          height={24}
          onClick={() => onChangeIsAreaSearching(false)}
        />
        <Input
          placeholder="동 이름 또는 지하철역명 입력"
          cssStyle={{ flex: 1 }}
          onKeyDown={handleSearch}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setSearchValue(e.target.value)
          }
        />
      </AreaSearchWrapper>
      <AreaSearchResultWrapper>
        {searchedLocalInfos ? (
          <>
            {searchedLocalInfos.length > 0 ? (
              searchedLocalInfos.map((item) => (
                <div
                  style={{
                    padding: '16px 0 12px',
                    borderBottom: '1px solid #f4f4f4',
                    cursor: 'pointer',
                  }}
                  key={item.address_name}
                  onClick={() => {
                    const is5kmInner = check5kmInner(item.x, item.y);
                    if (!is5kmInner) {
                      return message.warning('5km 이내 지역을 선택해주세요.');
                    }
                    onChangeSignupParams((signupParams) => ({
                      ...signupParams,
                      region: item.address_name,
                      city: getCityName(item),
                      dong: getDongName(item),
                    }));
                    onChangeIsAreaSearching(false);
                  }}
                >
                  <Typography.Text type="b2" regular>
                    {item.address_name}
                  </Typography.Text>
                </div>
              ))
            ) : (
              <Typography.Text
                type="b2"
                regular
                style={{
                  padding: '16px 0 12px',
                }}
              >
                검색 결과가 없습니다.
              </Typography.Text>
            )}
          </>
        ) : (
          <>
            <Typography.Text
              type="b2"
              regular
              style={{
                borderBottom: '1px solid #f4f4f4',
                padding: '16px 0 12px',
              }}
            >
              근처 동네
            </Typography.Text>
            {(!location.loaded || isLoading) && (
              <div
                style={{
                  padding: '16px 0 12px',
                }}
              >
                <Typography.Text type="b2" regular>
                  지역 정보를 받아오는 중입니다...
                </Typography.Text>
              </div>
            )}
            {localInfos.length > 0 &&
              localInfos.map((item) => (
                <div
                  style={{
                    padding: '16px 0 12px',
                    borderBottom: '1px solid #f4f4f4',
                    cursor: 'pointer',
                  }}
                  key={item.code}
                  onClick={() => {
                    onChangeSignupParams((signupParams) => ({
                      ...signupParams,
                      region: item.address_name,
                      city: item.region_1depth_name,
                      dong: item.region_3depth_name,
                    }));
                    onChangeIsAreaSearching(false);
                  }}
                >
                  <Typography.Text type="b2" regular>
                    {item.address_name}
                  </Typography.Text>
                </div>
              ))}
          </>
        )}
      </AreaSearchResultWrapper>
    </>
  );
};

export default AreaSearch;
